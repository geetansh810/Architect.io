import { toPascalCase, toCamelCase, toKebabCase } from '../utils/naming.js';
import { isTS } from '../utils/lang.js';

/**
 * ControllerEmitter — src/modules/{entity}/{entity}.controller.js
 * Thin HTTP layer: parse req, call service, send an ApiResponse. No
 * try/catch (asyncHandler forwards rejections to the error middleware).
 * Handlers are arrow-function class properties so they stay bound to
 * `this` when Express calls them as bare callbacks.
 */
export function emitControllerFile(entity, language = 'javascript') {
  const ts = isTS(language);
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const camelName = toCamelCase(entity.data?.name || entity.id);
  const kebabName = toKebabCase(entity.data?.name || entity.id);

  return `import service from './${kebabName}.service.js';
import { asyncHandler } from '../../core/asyncHandler.js';
import { ApiResponse } from '../../core/ApiResponse.js';
${ts ? `import type { Request, Response } from 'express';

interface ${pascalName}ControllerDeps {
  service: typeof service;
}
` : ''}
/**
 * Thin HTTP layer for ${pascalName}: parse the request, delegate to the
 * service, send a standardized ApiResponse. No business logic here.
 */
export class ${pascalName}Controller {
  #service${ts ? ': typeof service' : ''};

  constructor({ service }${ts ? `: ${pascalName}ControllerDeps` : ''}) {
    this.#service = service;
  }

  list = asyncHandler(async (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}) => {
    const { data, meta } = await this.#service.list(req.query);
    ApiResponse.success(res, data, '${pascalName} list retrieved', meta);
  });

  get = asyncHandler(async (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}) => {
    const ${camelName} = await this.#service.getById(req.params.id);
    ApiResponse.success(res, ${camelName});
  });

  create = asyncHandler(async (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}) => {
    const ${camelName} = await this.#service.create(req.body);
    ApiResponse.created(res, ${camelName}, '${pascalName} created');
  });

  update = asyncHandler(async (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}) => {
    const ${camelName} = await this.#service.update(req.params.id, req.body);
    ApiResponse.success(res, ${camelName}, '${pascalName} updated');
  });

  remove = asyncHandler(async (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}) => {
    await this.#service.remove(req.params.id);
    ApiResponse.noContent(res);
  });
}

export default new ${pascalName}Controller({ service });
`;
}
