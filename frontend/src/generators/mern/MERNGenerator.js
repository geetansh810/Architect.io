import { BaseGenerator } from '../BaseGenerator.js';
import { emitCoreFiles } from './emitters/CoreEmitter.js';
import { emitConfigFiles } from './emitters/ConfigEmitter.js';
import { emitMiddlewareFiles, emitCustomMiddlewareFiles } from './emitters/MiddlewareEmitter.js';
import { emitServerFiles } from './emitters/ServerEmitter.js';
import { emitSwaggerFile } from './emitters/SwaggerEmitter.js';
import { emitDockerFiles } from './emitters/DockerEmitter.js';
import { emitTestFiles } from './emitters/TestEmitter.js';
import { emitModelFile } from './emitters/ModelEmitter.js';
import { emitRepositoryFile } from './emitters/RepositoryEmitter.js';
import { emitHookFile } from './emitters/HookEmitter.js';
import { emitServiceFile } from './emitters/ServiceEmitter.js';
import { emitControllerFile } from './emitters/ControllerEmitter.js';
import { emitValidationFile } from './emitters/ValidationEmitter.js';
import { emitRouteFile } from './emitters/RouteEmitter.js';
import { emitTypeScriptProjectFiles, emitEntityTypesFile } from './emitters/TypeScriptEmitter.js';
import { toKebabCase } from './utils/naming.js';
import { DEFAULT_PROJECT_CONFIG } from './utils/projectConfig.js';
import { isTS } from './utils/lang.js';
import { entitiesForApi, entitiesForLogicNode } from './utils/graph.js';

/**
 * MERNGenerator — orchestrates every emitter into one generated project:
 * core/config/middleware/modules/events infrastructure, Docker/tests/
 * Swagger, and per-node custom code (LogicNode hooks, Custom middleware).
 */
export class MERNGenerator extends BaseGenerator {
  constructor() {
    super('mern');
    this._nodeFileMap = new Map();
    this._fileNodeMap = new Map();
  }

  generate(analysis, projectConfig = {}, _customCodeMap = {}) {
    const config = { ...DEFAULT_PROJECT_CONFIG, ...projectConfig };
    const useJoi = config.validation === 'joi';
    const withDocs = config.docs !== 'none';
    const apiPrefix = config.apiVersioning === false ? '/api' : '/api/v1';
    const language = config.language;
    const ext = isTS(language) ? 'ts' : 'js';

    this._nodeFileMap.clear();
    this._fileNodeMap.clear();

    const files = {};
    const put = (path, content, nodeId) => {
      files[path] = content;
      if (nodeId) this._trackNode(nodeId, path);
    };
    const putAll = (obj, nodeId) => {
      Object.entries(obj).forEach(([path, content]) => put(path, content, nodeId));
    };

    const apiEntities = analysis.entities.filter(
      (e) => (analysis.entityApiMap[e.id] || []).length > 0
    );

    // ── Cross-cutting infrastructure ──
    putAll(emitCoreFiles(language));
    putAll(emitConfigFiles(analysis, language));
    putAll(emitMiddlewareFiles(analysis, useJoi, language));
    emitCustomMiddlewareFiles(analysis, language).forEach(({ nodeId, path, content }) => put(path, content, nodeId));
    putAll(emitServerFiles(analysis, apiEntities, config));
    if (withDocs) put(`src/config/swagger.${ext}`, emitSwaggerFile(apiEntities, apiPrefix, language));
    put(`src/events/EventBus.${ext}`, eventBusFile(language));
    putAll(emitDockerFiles(analysis, language));
    putAll(emitTestFiles(analysis, apiEntities, language));
    put('README.md', readmeFile(analysis, apiEntities, config));
    if (isTS(language)) putAll(emitTypeScriptProjectFiles());

    // ── Per-entity module files ──
    const allTypedEntities = isTS(language)
      ? [...apiEntities, ...analysis.entities.filter((e) => !apiEntities.includes(e) && analysis.stats.dbCount > 0)]
      : [];
    allTypedEntities.forEach((entity) => {
      const kebab = toKebabCase(entity.data?.name || entity.id);
      put(`src/modules/${kebab}/${kebab}.types.ts`, emitEntityTypesFile(entity, analysis), entity.id);
    });

    apiEntities.forEach((entity) => {
      const kebab = toKebabCase(entity.data?.name || entity.id);
      const base = `src/modules/${kebab}`;
      putAll({
        [`${base}/${kebab}.model.${ext}`]: emitModelFile(entity, analysis, language),
        [`${base}/${kebab}.repository.${ext}`]: emitRepositoryFile(entity, analysis, language),
        [`${base}/${kebab}.hooks.${ext}`]: emitHookFile(entity, analysis, language),
        [`${base}/${kebab}.service.${ext}`]: emitServiceFile(entity, analysis, language),
        [`${base}/${kebab}.controller.${ext}`]: emitControllerFile(entity, language),
        [`${base}/${kebab}.validation.${ext}`]: emitValidationFile(entity, useJoi),
        [`${base}/${kebab}.routes.${ext}`]: emitRouteFile(entity, analysis),
      }, entity.id);
    });

    // Entities that exist on the canvas but aren't wired to an API still
    // get a model file if a database is connected, so relationships and
    // future API wiring have something to point at.
    analysis.entities
      .filter((e) => !apiEntities.includes(e) && analysis.stats.dbCount > 0)
      .forEach((entity) => {
        const kebab = toKebabCase(entity.data?.name || entity.id);
        put(`src/modules/${kebab}/${kebab}.model.${ext}`, emitModelFile(entity, analysis, language), entity.id);
      });

    this._trackInfrastructureNodes(analysis, apiEntities, ext, files);

    return this._toFileTree(files);
  }

  /**
   * Nodes that don't *own* a file still explain one — an Auth node is why
   * `middleware/auth.js` exists, an API node is why its entity has routes.
   * Without these the editor's "click a node, jump to its code" only worked
   * for entities and custom middleware, which is most of the canvas doing
   * nothing on click.
   */
  _trackInfrastructureNodes(analysis, apiEntities, ext, files) {
    const link = (nodeId, path) => {
      if (nodeId && files[path] !== undefined) this._trackNode(nodeId, path);
    };
    const moduleFiles = (entity, names) => {
      const kebab = toKebabCase(entity.data?.name || entity.id);
      return names.map((n) => `src/modules/${kebab}/${kebab}.${n}.${ext}`);
    };

    analysis.dbNodes?.forEach((n) => link(n.id, `src/config/database.${ext}`));
    analysis.cacheNodes?.forEach((n) => link(n.id, `src/config/redis.${ext}`));
    analysis.authNodes?.forEach((n) => {
      link(n.id, `src/middleware/auth.${ext}`);
      link(n.id, `src/middleware/authorize.${ext}`);
    });

    analysis.middlewareNodes?.forEach((n) => {
      const type = n.data?.middlewareType;
      if (type === 'Rate Limiter') link(n.id, `src/middleware/rateLimiter.${ext}`);
      if (type === 'Logger') link(n.id, `src/middleware/requestLogger.${ext}`);
      if (type === 'Validator') link(n.id, `src/middleware/validate.${ext}`);
      if (type === 'CORS') link(n.id, `src/server.${ext}`);
    });

    // An API node points at the route/controller pair of every entity it exposes.
    analysis.apiNodes?.forEach((n) => {
      entitiesForApi(n.id, analysis)
        .filter((e) => apiEntities.includes(e))
        .forEach((e) => moduleFiles(e, ['routes', 'controller']).forEach((p) => link(n.id, p)));
    });

    // A Logic Hook's code is assembled into its entity's hooks file.
    analysis.logicNodes?.forEach((n) => {
      entitiesForLogicNode(n.id, analysis)
        .filter((e) => apiEntities.includes(e))
        .forEach((e) => moduleFiles(e, ['hooks']).forEach((p) => link(n.id, p)));
    });
  }

  getFileForNode(nodeId) {
    return this._nodeFileMap.get(nodeId) || [];
  }

  getNodeForFile(filePath) {
    return this._fileNodeMap.get(filePath) || null;
  }

  _trackNode(nodeId, path) {
    if (!this._nodeFileMap.has(nodeId)) this._nodeFileMap.set(nodeId, []);
    const paths = this._nodeFileMap.get(nodeId);
    if (!paths.includes(path)) paths.push(path);
    // A file can be *explained* by several nodes (an entity and the API that
    // exposes it both point at the routes file), but the reverse lookup —
    // "which node should the canvas select for this file" — has one answer:
    // whoever emitted it, not whoever merely references it.
    if (!this._fileNodeMap.has(path)) this._fileNodeMap.set(path, nodeId);
  }

  _toFileTree(files) {
    return Object.entries(files).map(([path, content]) => ({
      path,
      content,
      language: languageFor(path),
    }));
  }
}

function eventBusFile(language) {
  const ts = isTS(language);
  return `import { EventEmitter } from 'events';

/**
 * eventBus — process-local pub/sub for cross-cutting concerns (email,
 * analytics, cache invalidation) that shouldn't block the request that
 * triggered them. Register listeners in src/events/listeners/.
 */
export const eventBus${ts ? ': EventEmitter' : ''} = new EventEmitter();

export default eventBus;
`;
}

function readmeFile(analysis, apiEntities, config) {
  const { stats } = analysis;
  const apiPrefix = config.apiVersioning === false ? '/api' : '/api/v1';
  return `# Generated Project

This backend was automatically generated by **Architect.io**.

## Architecture Overview
- **Language**: ${isTS(config.language) ? 'TypeScript' : 'JavaScript'}
- **Modules**: ${apiEntities.length} (${apiEntities.map((e) => e.data?.name || e.id).join(', ') || 'none'})
- **Database**: ${stats.dbCount > 0 ? (stats.isPostgres ? 'PostgreSQL' : 'MongoDB') : 'None'}
- **Caching**: ${stats.hasCaching ? 'Redis' : 'No'}
- **Auth**: ${stats.hasAuth || analysis.apiNodes.some((n) => n.data?.authEnabled) ? 'JWT' : 'No'}
- **Validation**: ${config.validation === 'joi' ? 'Joi' : 'Zod'}
- **API prefix**: \`${apiPrefix}\`

## Getting Started

\`\`\`bash
npm install
cp .env.example .env
npm run dev
\`\`\`
${isTS(config.language) ? '\nRuns on `tsx` in dev (no build step needed); `npm run build` compiles to `dist/` and `npm start` runs the compiled output for production.\n' : ''}

${config.docs !== 'none' ? 'API docs: `GET /api-docs` · ' : ''}Health check: \`GET /health\`

## Docker

\`\`\`bash
docker-compose up -d
\`\`\`

## Tests

\`\`\`bash
npm test
\`\`\`
`;
}

function languageFor(path) {
  if (path.endsWith('.d.ts') || path.endsWith('.ts')) return 'typescript';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
  if (path.endsWith('.md')) return 'markdown';
  if (path === 'Dockerfile' || path === '.dockerignore' || path === '.gitignore' || path === '.env.example') return 'bash';
  return 'javascript';
}

export default MERNGenerator;
