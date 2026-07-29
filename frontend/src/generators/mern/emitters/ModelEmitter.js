import { toPascalCase, toKebabCase } from '../utils/naming.js';
import { isEmailField, isPasswordField, hasPasswordField } from '../utils/fieldHeuristics.js';
import { isTS } from '../utils/lang.js';

const TYPE_MAP = { number: 'Number', boolean: 'Boolean', date: 'Date' };

/**
 * ModelEmitter — src/modules/{entity}/{entity}.model.js
 * Mongoose schema for now; the Postgres path stays a thin query-based
 * model since there's no shared ORM configured for that target yet.
 */
export function emitModelFile(entity, analysis, language = 'javascript') {
  const pascalName = toPascalCase(entity.data?.name || entity.id);

  if (analysis.stats.isPostgres) {
    return postgresModel(pascalName, language);
  }
  return mongooseModel(entity, pascalName, language);
}

function buildFieldLine(f) {
  const type = TYPE_MAP[f.type] || 'String';
  const parts = [`type: ${type}`, `required: ${f.required ? 'true' : 'false'}`];
  if (f.unique) parts.push('unique: true');
  if (type === 'String') {
    parts.push('trim: true');
    if (isEmailField(f)) parts.push('lowercase: true');
    if (isPasswordField(f)) { parts.push('select: false'); parts.push('minlength: 8'); }
  }
  return `    ${f.name}: { ${parts.join(', ')} }`;
}

function mongooseModel(entity, pascalName, language) {
  const ts = isTS(language);
  const fields = entity.data?.fields || [];
  const schemaFields = fields.map(buildFieldLine).join(',\n');
  const withPassword = hasPasswordField(fields);
  const kebabName = toKebabCase(entity.data?.name || entity.id);

  return `import mongoose from 'mongoose';
${withPassword ? "import bcrypt from 'bcryptjs';\n" : ''}${ts ? `import type { Model } from 'mongoose';
import type { ${pascalName}Document } from './${kebabName}.types.js';
` : ''}
${ts ? `// Left un-parametrized: mongoose's Schema<T> generic validates the schema\n// definition object against T's exact shape, which fights the isDeleted/\n// deletedAt soft-delete bookkeeping fields below. Cast at the export\n// boundary instead — the interface is the source of truth for consumers,\n// this schema is the source of truth for what's actually persisted.\n` : ''}const schema = new mongoose.Schema(
  {
${schemaFields || '    // Add fields here'}${schemaFields ? ',' : ''}
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret${ts ? ': any' : ''}) => {
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
${withPassword ? '        delete ret.password;\n' : ''}        return ret;
      },
    },
  }
);

schema.index({ createdAt: -1 });
schema.index({ isDeleted: 1 });

// Soft-deleted documents are invisible to every find*/findOne*/findById*
// query by default; repository.softDelete() flips isDeleted instead of
// removing the row, and this hook keeps callers from having to remember
// to filter it back out themselves.
${ts ? '// Mongoose\'s typings for schema.pre() don\'t reliably infer `this` for regex-\n// matched or password-hashing hooks, so it\'s typed loosely here rather than\n// fighting the overloads.\n' : ''}schema.pre(/^find/, function excludeDeleted(${ts ? 'this: any, ' : ''}next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});
${withPassword ? `
schema.pre('save', async function hashPassword(${ts ? 'this: any, ' : ''}next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/** Compare a plaintext password against the stored hash. */
schema.methods.comparePassword = function comparePassword(${ts ? 'this: any, ' : ''}candidate${ts ? ': string' : ''}) {
  return bcrypt.compare(candidate, this.password);
};
` : ''}
export const ${pascalName} = mongoose.model('${pascalName}', schema)${ts ? ` as unknown as Model<${pascalName}Document>` : ''};

export default ${pascalName};
`;
}

function postgresModel(pascalName, language) {
  const ts = isTS(language);
  const table = toKebabCase(pascalName);
  return `// Raw pg queries. Swap for Prisma/Drizzle if you need a query builder.
import pool from '../../config/database.js';
${ts ? `\ntype ${pascalName}Row = Record<string, unknown>;\n` : ''}
export class ${pascalName}Model {
  static async findMany({ where = '', params = [], limit = 20, offset = 0 }${ts ? ': { where?: string; params?: unknown[]; limit?: number; offset?: number }' : ''} = {})${ts ? `: Promise<${pascalName}Row[]>` : ''} {
    const { rows } = await pool.query(
      \`SELECT * FROM ${table} \${where} ORDER BY created_at DESC LIMIT \${limit} OFFSET \${offset}\`,
      params
    );
    return rows;
  }

  static async count()${ts ? ': Promise<number>' : ''} {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM ${table}');
    return rows[0].count;
  }

  static async findById(id${ts ? ': string' : ''})${ts ? `: Promise<${pascalName}Row | null>` : ''} {
    const { rows } = await pool.query('SELECT * FROM ${table} WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async create(data${ts ? `: Record<string, unknown>` : ''})${ts ? `: Promise<${pascalName}Row>` : ''} {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ');
    const { rows } = await pool.query(
      \`INSERT INTO ${table} (\${keys.join(', ')}) VALUES (\${placeholders}) RETURNING *\`,
      values
    );
    return rows[0];
  }

  static async update(id${ts ? ': string' : ''}, data${ts ? `: Record<string, unknown>` : ''})${ts ? `: Promise<${pascalName}Row | null>` : ''} {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const assignments = keys.map((k, i) => \`\${k} = $\${i + 1}\`).join(', ');
    const { rows } = await pool.query(
      \`UPDATE ${table} SET \${assignments} WHERE id = $\${keys.length + 1} RETURNING *\`,
      [...values, id]
    );
    return rows[0] || null;
  }

  static async remove(id${ts ? ': string' : ''})${ts ? `: Promise<${pascalName}Row | null>` : ''} {
    const { rows } = await pool.query('DELETE FROM ${table} WHERE id = $1 RETURNING id', [id]);
    return rows[0] || null;
  }
}

export default ${pascalName}Model;
`;
}
