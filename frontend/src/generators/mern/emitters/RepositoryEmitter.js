import { toPascalCase, toKebabCase } from '../utils/naming.js';
import { isTS } from '../utils/lang.js';

/**
 * RepositoryEmitter — src/modules/{entity}/{entity}.repository.js
 * The only layer allowed to talk to the model/database directly.
 */
export function emitRepositoryFile(entity, analysis, language = 'javascript') {
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const kebabName = toKebabCase(entity.data?.name || entity.id);

  if (analysis.stats.isPostgres) {
    return postgresRepository(pascalName, kebabName, language);
  }
  return mongooseRepository(pascalName, kebabName, language);
}

function mongooseRepository(pascalName, kebabName, language) {
  const ts = isTS(language);
  const docType = `${pascalName}Document`;
  return `import { ${pascalName} } from './${kebabName}.model.js';
import { NotFoundError, ConflictError } from '../../core/AppError.js';
${ts ? `import type { ${docType} } from './${kebabName}.types.js';
import type { FilterQuery } from 'mongoose';

interface FindManyOptions {
  skip?: number;
  limit?: number;
  sort?: string;
  select?: string;
  populate?: string;
}
` : ''}
/**
 * Data access layer for ${pascalName}. Services never import the model
 * directly — every query goes through here so the persistence details
 * (Mongoose, soft-delete filtering, duplicate-key handling) stay in one
 * place.
 */
export class ${pascalName}Repository {
${ts ? '' : `  /**
   * @param {object} filters - Mongo-compatible filter object
   * @param {object} options - { skip, limit, sort, select, populate }
   * @returns {Promise<{data: object[], total: number}>}
   */
`}  async findMany(filters${ts ? `: FilterQuery<${docType}>` : ''} = {}, options${ts ? ': FindManyOptions' : ''} = {})${ts ? `: Promise<{ data: ${docType}[]; total: number }>` : ''} {
    const { skip = 0, limit = 20, sort = '-createdAt', select, populate } = options;
    const [data, total] = await Promise.all([
      ${pascalName}.find(filters).sort(sort).skip(skip).limit(limit).select(select${ts ? ' as string' : ''}).populate(populate || ''),
      ${pascalName}.countDocuments(filters),
    ]);
    return { data, total };
  }

${ts ? '  /** @throws {NotFoundError} if no matching document exists */\n' : `  /**
   * @throws {NotFoundError} if no matching document exists
   */
`}  async findById(id${ts ? ': string' : ''}, options${ts ? ': Pick<FindManyOptions, \'select\' | \'populate\'>' : ''} = {})${ts ? `: Promise<${docType}>` : ''} {
    const doc = await ${pascalName}.findById(id).select(options.select${ts ? ' as string' : ''}).populate(options.populate || '');
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

${ts ? '  /** @throws {ConflictError} if a unique field (e.g. email) already exists */\n' : `  /**
   * @throws {ConflictError} if a unique field (e.g. email) already exists
   */
`}  async create(data${ts ? `: Partial<${docType}>` : ''})${ts ? `: Promise<${docType}>` : ''} {
    try {
      return await ${pascalName}.create(data);
    } catch (err${ts ? ': any' : ''}) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        throw new ConflictError('${pascalName}', field, err.keyValue?.[field]);
      }
      throw err;
    }
  }

${ts ? '  /** @throws {NotFoundError} if no matching document exists */\n' : `  /**
   * @throws {NotFoundError} if no matching document exists
   */
`}  async update(id${ts ? ': string' : ''}, data${ts ? `: Partial<${docType}>` : ''})${ts ? `: Promise<${docType}>` : ''} {
    const doc = await ${pascalName}.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

${ts ? '  /**\n   * Soft delete: flips isDeleted/deletedAt rather than removing the row,\n   * so the document survives for auditing and can\'t be re-deleted.\n   * @throws {NotFoundError} if no matching (non-deleted) document exists\n   */\n' : `  /**
   * Soft delete: flips isDeleted/deletedAt rather than removing the row,
   * so the document survives for auditing and can't be re-deleted.
   * @throws {NotFoundError} if no matching (non-deleted) document exists
   */
`}  async softDelete(id${ts ? ': string' : ''})${ts ? `: Promise<${docType}>` : ''} {
    const doc = await ${pascalName}.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

  async exists(filter${ts ? `: FilterQuery<${docType}>` : ''})${ts ? ': Promise<boolean>' : ''} {
    return Boolean(await ${pascalName}.exists(filter));
  }
}

export default new ${pascalName}Repository();
`;
}

function postgresRepository(pascalName, kebabName, language) {
  const ts = isTS(language);
  return `import { ${pascalName}Model } from './${kebabName}.model.js';
import { NotFoundError } from '../../core/AppError.js';
${ts ? `\ntype ${pascalName}Row = Record<string, unknown>;\n` : ''}
/**
 * Data access layer for ${pascalName}, backed by raw pg queries.
 */
export class ${pascalName}Repository {
  async findMany(_filters${ts ? ': Record<string, unknown>' : ''} = {}, options${ts ? ': { skip?: number; limit?: number }' : ''} = {})${ts ? `: Promise<{ data: ${pascalName}Row[]; total: number }>` : ''} {
    const { skip = 0, limit = 20 } = options;
    const [data, total] = await Promise.all([
      ${pascalName}Model.findMany({ limit, offset: skip }),
      ${pascalName}Model.count(),
    ]);
    return { data, total };
  }

  /** @throws {NotFoundError} if no matching row exists */
  async findById(id${ts ? ': string' : ''})${ts ? `: Promise<${pascalName}Row>` : ''} {
    const doc = await ${pascalName}Model.findById(id);
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

  async create(data${ts ? ': Record<string, unknown>' : ''})${ts ? `: Promise<${pascalName}Row>` : ''} {
    return ${pascalName}Model.create(data);
  }

  /** @throws {NotFoundError} if no matching row exists */
  async update(id${ts ? ': string' : ''}, data${ts ? ': Record<string, unknown>' : ''})${ts ? `: Promise<${pascalName}Row>` : ''} {
    const doc = await ${pascalName}Model.update(id, data);
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

  /** @throws {NotFoundError} if no matching row exists */
  async softDelete(id${ts ? ': string' : ''})${ts ? `: Promise<${pascalName}Row>` : ''} {
    const doc = await ${pascalName}Model.remove(id);
    if (!doc) throw new NotFoundError('${pascalName}', id);
    return doc;
  }

  async exists(id${ts ? ': string' : ''})${ts ? ': Promise<boolean>' : ''} {
    return Boolean(await ${pascalName}Model.findById(id));
  }
}

export default new ${pascalName}Repository();
`;
}
