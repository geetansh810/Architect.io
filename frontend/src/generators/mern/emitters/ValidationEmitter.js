import { toPascalCase } from '../utils/naming.js';
import { isEmailField, isPasswordField } from '../utils/fieldHeuristics.js';

/**
 * ValidationEmitter — src/modules/{entity}/{entity}.validation.js
 * Schemas for create/update/query, consumed by middleware/validate.js.
 * Zod by default; Joi when the project config selects it — exported
 * schema names are identical either way, so RouteEmitter never needs to
 * know which library is in play.
 */
export function emitValidationFile(entity, useJoi = false) {
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const fields = entity.data?.fields || [];

  return useJoi ? joiValidationFile(pascalName, fields) : zodValidationFile(pascalName, fields);
}

function zodValidationFile(pascalName, fields) {
  const createFields = fields.map((f) => `    ${f.name}: ${zodExpr(f, f.required)},`).join('\n');
  const updateFields = fields.map((f) => `    ${f.name}: ${zodExpr(f, false)},`).join('\n');

  return `import { z } from 'zod';

export const create${pascalName}Schema = z.object({
  body: z.object({
${createFields || '    // Add fields here'}
  }),
});

export const update${pascalName}Schema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
${updateFields || '    // Add fields here'}
  }).refine((obj) => Object.keys(obj).length > 0, { message: 'At least one field required' }),
});

export const get${pascalName}Schema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const list${pascalName}Schema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    search: z.string().optional(),
  }),
});
`;
}

function zodExpr(field, required) {
  let expr;
  if (field.type === 'number') expr = 'z.coerce.number()';
  else if (field.type === 'boolean') expr = 'z.coerce.boolean()';
  else if (field.type === 'date') expr = 'z.coerce.date()';
  else if (isEmailField(field)) expr = 'z.string().email().toLowerCase().trim()';
  else if (isPasswordField(field)) expr = 'z.string().min(8).max(128)';
  else expr = 'z.string().trim()';
  return required ? expr : `${expr}.optional()`;
}

function joiValidationFile(pascalName, fields) {
  const createFields = fields.map((f) => `    ${f.name}: ${joiExpr(f, f.required)},`).join('\n');
  const updateFields = fields.map((f) => `    ${f.name}: ${joiExpr(f, false)},`).join('\n');

  return `import Joi from 'joi';

export const create${pascalName}Schema = Joi.object({
  body: Joi.object({
${createFields || '    // Add fields here'}
  }),
});

export const update${pascalName}Schema = Joi.object({
  params: Joi.object({ id: Joi.string().min(1).required() }),
  body: Joi.object({
${updateFields || '    // Add fields here'}
  }).min(1).messages({ 'object.min': 'At least one field required' }),
});

export const get${pascalName}Schema = Joi.object({
  params: Joi.object({ id: Joi.string().min(1).required() }),
});

export const list${pascalName}Schema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    search: Joi.string().optional(),
  }),
});
`;
}

function joiExpr(field, required) {
  let expr;
  if (field.type === 'number') expr = 'Joi.number()';
  else if (field.type === 'boolean') expr = 'Joi.boolean()';
  else if (field.type === 'date') expr = 'Joi.date()';
  else if (isEmailField(field)) expr = 'Joi.string().email().lowercase().trim()';
  else if (isPasswordField(field)) expr = 'Joi.string().min(8).max(128)';
  else expr = 'Joi.string().trim()';
  return required ? `${expr}.required()` : expr;
}
