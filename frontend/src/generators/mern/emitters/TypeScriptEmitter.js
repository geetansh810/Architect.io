import { toPascalCase } from '../utils/naming.js';
import { hasPasswordField } from '../utils/fieldHeuristics.js';

const TS_TYPE_MAP = { number: 'number', boolean: 'boolean', date: 'Date' };

/**
 * TypeScriptEmitter — everything that only exists when the project config
 * selects `language: 'typescript'`: tsconfig.json, the Express Request
 * augmentation, shared API-envelope types, and one `{entity}.types.ts`
 * per entity so the model/repository/service/controller layers all agree
 * on the same shape without importing from each other.
 */
export function emitTypeScriptProjectFiles() {
  return {
    'tsconfig.json': tsconfigFile(),
    'src/types/express.d.ts': expressAugmentationFile(),
    'src/types/api.ts': apiTypesFile(),
  };
}

export function emitEntityTypesFile(entity, analysis) {
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const fields = entity.data?.fields || [];
  const withPassword = hasPasswordField(fields);
  const isMongo = !analysis.stats.isPostgres;

  const fieldLines = fields
    .map((f) => `  ${f.name}${f.required ? '' : '?'}: ${tsFieldType(f)};`)
    .join('\n');

  return `/**
 * Canonical shape for ${pascalName}, shared by the model, repository,
 * service, and controller layers — a field change on the canvas only
 * needs this file (and the emitters that read it) regenerated.
 */
export interface ${pascalName} {
  _id: string;
${fieldLines || '  // Add fields here'}
  createdAt: Date;
  updatedAt: Date;
}

export type Create${pascalName}Input = Omit<${pascalName}, '_id' | 'createdAt' | 'updatedAt'>;
export type Update${pascalName}Input = Partial<Create${pascalName}Input>;
${isMongo ? `
import type { Document } from 'mongoose';

/** The Mongoose hydrated document shape — what \`${pascalName}.find()\` etc. actually resolve to. */
export interface ${pascalName}Document extends Omit<${pascalName}, '_id'>, Document {
${withPassword ? '  comparePassword(candidate: string): Promise<boolean>;\n' : '  _placeholder?: never;\n'}}
` : ''}`;
}

function tsFieldType(field) {
  return TS_TYPE_MAP[field.type] || 'string';
}

function tsconfigFile() {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: ['ES2022'],
      outDir: 'dist',
      rootDir: 'src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      forceConsistentCasingInFileNames: true,
      sourceMap: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
    },
    include: ['src/**/*.ts', 'src/**/*.d.ts'],
    exclude: ['node_modules', 'dist', 'tests', '**/*.test.ts'],
  }, null, 2);
}

function expressAugmentationFile() {
  return `/**
 * Augments Express's Request type with the fields our own middleware
 * attaches (core/requestId.js, middleware/auth.js) so every handler sees
 * them without an ad hoc cast.
 */
export interface AuthUser {
  id: string;
  role?: string;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthUser;
    }
  }
}

export {};
`;
}

function apiTypesFile() {
  return `/**
 * Shared response-envelope types, matching core/ApiResponse.js and
 * core/pagination.js at runtime — kept here instead of inferred so
 * controllers can declare their return shape up front.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: (Partial<PaginationMeta> & Record<string, unknown>) | null;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
`;
}
