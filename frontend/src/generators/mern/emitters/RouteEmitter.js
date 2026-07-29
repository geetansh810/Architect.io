import { toPascalCase, toKebabCase } from '../utils/naming.js';

/**
 * RouteEmitter — src/modules/{entity}/{entity}.routes.js
 * Wires Zod validation + optional auth middleware to the controller.
 * Content is identical for JS/TS (no type annotations needed here) —
 * only the file extension, decided by the caller, differs.
 */
export function emitRouteFile(entity, analysis) {
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const kebabName = toKebabCase(entity.data?.name || entity.id);

  const apiNodeIds = analysis.entityApiMap[entity.id] || [];
  const requiresAuth = apiNodeIds.some((id) => {
    const apiNode = analysis.apiNodes.find((n) => n.id === id);
    return apiNode?.data?.authEnabled;
  });

  return `import { Router } from 'express';
import controller from './${kebabName}.controller.js';
import { validate } from '../../middleware/validate.js';
${requiresAuth ? `import { auth } from '../../middleware/auth.js';\n` : ''}import {
  create${pascalName}Schema,
  update${pascalName}Schema,
  get${pascalName}Schema,
  list${pascalName}Schema,
} from './${kebabName}.validation.js';

const router = Router();
${requiresAuth ? '\nrouter.use(auth);\n' : ''}
router.get('/', validate(list${pascalName}Schema), controller.list);
router.get('/:id', validate(get${pascalName}Schema), controller.get);
router.post('/', validate(create${pascalName}Schema), controller.create);
router.put('/:id', validate(update${pascalName}Schema), controller.update);
router.delete('/:id', validate(get${pascalName}Schema), controller.remove);

export default router;
`;
}
