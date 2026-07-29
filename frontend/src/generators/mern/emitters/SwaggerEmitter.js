import { toPascalCase, toKebabCase } from '../utils/naming.js';
import { isTS } from '../utils/lang.js';

/**
 * SwaggerEmitter — src/config/swagger.js, a minimal OpenAPI 3 document
 * built from the entities on the canvas, served at /api-docs. Paths are
 * relative to `servers[].url` per the OpenAPI spec — they must NOT repeat
 * the API prefix that's already in the server URL.
 */
export function emitSwaggerFile(apiEntities, apiPrefix = '/api/v1', language = 'javascript') {
  const ts = isTS(language);
  const paths = apiEntities.map((e) => {
    const pascalName = toPascalCase(e.data?.name || e.id);
    const kebabName = toKebabCase(e.data?.name || e.id);
    return `    '/${kebabName}': {
      get: { summary: 'List ${pascalName}', tags: ['${pascalName}'], responses: { 200: { description: 'OK' } } },
      post: { summary: 'Create ${pascalName}', tags: ['${pascalName}'], responses: { 201: { description: 'Created' } } },
    },
    '/${kebabName}/{id}': {
      get: { summary: 'Get ${pascalName} by id', tags: ['${pascalName}'], responses: { 200: { description: 'OK' } } },
      put: { summary: 'Update ${pascalName}', tags: ['${pascalName}'], responses: { 200: { description: 'OK' } } },
      delete: { summary: 'Delete ${pascalName}', tags: ['${pascalName}'], responses: { 204: { description: 'No Content' } } },
    },`;
  }).join('\n');

  return `/**
 * OpenAPI document served at GET /api-docs. Hand-built from the canvas
 * entities; swap for swagger-jsdoc route annotations as modules grow.
 */
export const swaggerDocument${ts ? ': Record<string, unknown>' : ''} = {
  openapi: '3.0.0',
  info: {
    title: 'Architect.io Generated API',
    version: '1.0.0',
    description: 'Auto-generated from your Architect.io canvas.',
  },
  servers: [{ url: '${apiPrefix}' }],
  paths: {
${paths || '    // No API-connected entities on the canvas yet'}
  },
};

export default swaggerDocument;
`;
}
