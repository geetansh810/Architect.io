import { toPascalCase, toCamelCase, toKebabCase } from '../utils/naming.js';
import { isPasswordField } from '../utils/fieldHeuristics.js';
import { isTS } from '../utils/lang.js';

/**
 * ServiceEmitter — src/modules/{entity}/{entity}.service.js
 * Business logic layer: repository + lifecycle hooks + event emission via
 * constructor-injected dependencies (never imported ad hoc mid-method),
 * with an optional cache-aside read path when a Cache node is wired to
 * this entity's API. Never touches req/res.
 */
export function emitServiceFile(entity, analysis, language = 'javascript') {
  const ts = isTS(language);
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const camelName = toCamelCase(entity.data?.name || entity.id);
  const kebabName = toKebabCase(entity.data?.name || entity.id);
  const allowedFilters = (entity.data?.fields || [])
    .filter((f) => f.name && !isPasswordField(f))
    .map((f) => f.name);
  const useCache = entityUsesCache(entity, analysis);
  const isPostgres = Boolean(analysis.stats.isPostgres);
  const docType = isPostgres ? `${pascalName}Row` : `${pascalName}Document`;

  return `import repository from './${kebabName}.repository.js';
import hooks from './${kebabName}.hooks.js';
import { parseQueryParams } from '../../core/filterQuery.js';
import { buildPaginationMeta } from '../../core/pagination.js';
import { eventBus } from '../../events/EventBus.js';
${useCache ? `import { getRedisClient } from '../../config/redis.js';\n` : ''}${ts ? `import type { Create${pascalName}Input, Update${pascalName}Input${isPostgres ? '' : `, ${docType}`} } from './${kebabName}.types.js';
import type { PaginationMeta } from '../../types/api.js';
${isPostgres ? `\ntype ${docType} = Record<string, unknown>;\n` : ''}
interface ${pascalName}ServiceDeps {
  repository: typeof repository;
  hooks: typeof hooks;
  eventBus: typeof eventBus;
${useCache ? '  cache?: typeof getRedisClient;\n' : ''}}
` : ''}
const ALLOWED_FILTERS = ${JSON.stringify(allowedFilters)};
${useCache ? `const CACHE_TTL_SECONDS = 3600;\n` : ''}
/**
 * Business logic for ${pascalName}. Orchestrates the repository, lifecycle
 * hooks, and event emission — never queries the database or touches
 * req/res directly.
 */
export class ${pascalName}Service {
  #repo${ts ? `: typeof repository` : ''};
  #hooks${ts ? `: typeof hooks` : ''};
  #events${ts ? `: typeof eventBus` : ''};
${useCache ? `  #cache${ts ? '?: typeof getRedisClient' : ''};\n` : ''}
  constructor({ repository, hooks, eventBus${useCache ? ', cache' : ''} }${ts ? `: ${pascalName}ServiceDeps` : ' = {}'}) {
    this.#repo = repository;
    this.#hooks = hooks;
    this.#events = eventBus;
${useCache ? '    this.#cache = cache;\n' : ''}  }

  /**
   * List ${pascalName}s with filtering, sorting, and pagination.
   * @param {object} query - raw req.query
   * @returns {Promise<{data: object[], meta: object}>}
   */
  async list(query${ts ? ': Record<string, unknown>' : ''} = {})${ts ? `: Promise<{ data: ${docType}[]; meta: PaginationMeta }>` : ''} {
    const { filters, options } = parseQueryParams(query, ALLOWED_FILTERS);
    const { data, total } = await this.#repo.findMany(filters, options);
    return { data, meta: buildPaginationMeta(total, options.page, options.limit) };
  }

  /**
   * Get a single ${pascalName} by id.
   * @throws {NotFoundError} if no matching document exists
   */
  async getById(id${ts ? ': string' : ''})${ts ? `: Promise<${docType}>` : ''} {
${useCache ? cacheAsideRead(camelName, ts, docType) : `    return this.#repo.findById(id);`}
  }

  /**
   * Create a new ${pascalName}.
   * @throws {ConflictError} if a unique field already exists
   */
  async create(payload${ts ? `: Create${pascalName}Input` : ''})${ts ? `: Promise<${docType}>` : ''} {
    const processed = await this.#hooks.beforeCreate(payload);
    const created = await this.#repo.create(processed);
    await this.#hooks.afterCreate(created);
    this.#events.emit('${camelName}.created', created);
    return created;
  }

  /**
   * Update an existing ${pascalName}.
   * @throws {NotFoundError} if no matching document exists
   */
  async update(id${ts ? ': string' : ''}, payload${ts ? `: Update${pascalName}Input` : ''})${ts ? `: Promise<${docType}>` : ''} {
    const processed = await this.#hooks.beforeUpdate(payload);
    const updated = await this.#repo.update(id, processed);
    await this.#hooks.afterUpdate(updated);
${useCache ? `    await this.#cache?.()?.del(\`${camelName}:\${id}\`);\n` : ''}    this.#events.emit('${camelName}.updated', updated);
    return updated;
  }

  /**
   * Soft-delete a ${pascalName}.
   * @throws {NotFoundError} if no matching document exists
   */
  async remove(id${ts ? ': string' : ''})${ts ? `: Promise<${docType}>` : ''} {
    await this.#hooks.beforeDelete(id);
    const removed = await this.#repo.softDelete(id);
    await this.#hooks.afterDelete(removed);
${useCache ? `    await this.#cache?.()?.del(\`${camelName}:\${id}\`);\n` : ''}    this.#events.emit('${camelName}.deleted', removed);
    return removed;
  }
}

export default new ${pascalName}Service({ repository, hooks, eventBus${useCache ? ', cache: getRedisClient' : ''} });
`;
}

function cacheAsideRead(camelName, ts, docType) {
  return `    const cacheKey = \`${camelName}:\${id}\`;
    const client = this.#cache?.();
    const cached = await client?.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const doc = await this.#repo.findById(id);
    await client?.set(cacheKey, JSON.stringify(doc), 'EX', CACHE_TTL_SECONDS);
    return doc${ts ? ` as ${docType}` : ''};`;
}

function entityUsesCache(entity, analysis) {
  if (!analysis.stats.hasCaching) return false;
  const apiNodeIds = analysis.entityApiMap[entity.id] || [];
  return apiNodeIds.some((apiId) =>
    (analysis.outgoing[apiId] || []).some((targetId) => analysis.cacheNodes.some((c) => c.id === targetId))
  );
}
