import { fileExt, isTS } from '../utils/lang.js';

/**
 * CoreEmitter — emits the framework-agnostic src/core/ infrastructure
 * shared by every generated module: typed errors, the async wrapper,
 * a uniform API response envelope, pagination helpers, and a logger.
 */
export function emitCoreFiles(language = 'javascript') {
  const ext = fileExt(language);
  return {
    [`src/core/AppError.${ext}`]: appErrorFile(language),
    [`src/core/asyncHandler.${ext}`]: asyncHandlerFile(language),
    [`src/core/ApiResponse.${ext}`]: apiResponseFile(language),
    [`src/core/pagination.${ext}`]: paginationFile(language),
    [`src/core/filterQuery.${ext}`]: filterQueryFile(language),
    [`src/core/requestId.${ext}`]: requestIdFile(language),
    [`src/core/logger.${ext}`]: loggerFile(language),
  };
}

function appErrorFile(language) {
  const ts = isTS(language);
  return `/**
 * AppError — base class for all operational errors thrown by the app.
 * errorHandler middleware knows how to serialize these consistently;
 * anything that isn't an AppError is treated as an unexpected 500.
 */
export class AppError extends Error {
${ts ? '  statusCode: number;\n  code: string;\n  isOperational: boolean;\n  errors?: Array<{ field: string; message: string }>;\n\n' : ''}  constructor(message${ts ? ': string' : ''}, statusCode${ts ? ': number' : ''} = 500, code${ts ? ': string' : ''} = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource${ts ? ': string' : ''} = 'Resource', id${ts ? ': string | null' : ''} = null) {
    super(\`\${resource}\${id ? \` '\${id}'\` : ''} not found\`, 404, 'RESOURCE_NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(errors${ts ? ': Array<{ field: string; message: string }>' : ''} = []) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message${ts ? ': string' : ''} = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message${ts ? ': string' : ''} = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(resource${ts ? ': string' : ''} = 'Resource', field${ts ? ': string | null' : ''} = null, value${ts ? ': unknown' : ''} = null) {
    const detail = field ? \` with \${field} '\${value}'\` : '';
    super(\`\${resource}\${detail} already exists\`, 409, 'CONFLICT');
  }
}
`;
}

function asyncHandlerFile(language) {
  if (!isTS(language)) {
    return `/**
 * asyncHandler — wraps an async Express handler so rejected promises are
 * forwarded to next(err) instead of crashing the process.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
`;
  }
  return `import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * asyncHandler — wraps an async Express handler so rejected promises are
 * forwarded to next(err) instead of crashing the process.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
`;
}

function apiResponseFile(language) {
  const ts = isTS(language);
  const metaType = 'ApiMeta';
  return `${ts ? "import type { Response } from 'express';\nimport type { PaginationMeta } from '../types/api.js';\n\ntype ApiMeta = Record<string, unknown> | PaginationMeta;\n\n" : ''}/**
 * ApiResponse — uniform success envelope for all endpoints:
 * { success, message, data, meta }
 */
export class ApiResponse${ts ? '<T = unknown>' : ''} {
${ts ? `  success: boolean;\n  statusCode: number;\n  message: string;\n  data: T | null;\n  meta?: ${metaType} | null;\n\n` : ''}  constructor(statusCode${ts ? ': number' : ''}, data${ts ? ': T | null' : ''} = null, message${ts ? ': string' : ''} = 'Success', meta${ts ? `: ${metaType} | null` : ''} = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  // res.req is Express's back-reference to the request, so every response
  // automatically carries the same X-Request-Id core/requestId.js attached —
  // callers never have to thread requestId through manually.
  static send${ts ? '<T = unknown>' : ''}(res${ts ? ': Response' : ''}, { statusCode = 200, data = null, message = 'Success', meta = null }${ts ? `: { statusCode?: number; data?: T | null; message?: string; meta?: ${metaType} | null }` : ''} = {}) {
    const requestId = res.req?.requestId;
    const fullMeta = requestId ? { ...(meta || {}), requestId } : meta;
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, fullMeta));
  }

  static success${ts ? '<T = unknown>' : ''}(res${ts ? ': Response' : ''}, data${ts ? ': T' : ''}, message${ts ? ': string' : ''} = 'Success', meta${ts ? `: ${metaType} | null` : ''} = null, statusCode${ts ? ': number' : ''} = 200) {
    return ApiResponse.send(res, { statusCode, data, message, meta });
  }

  static created${ts ? '<T = unknown>' : ''}(res${ts ? ': Response' : ''}, data${ts ? ': T' : ''}, message${ts ? ': string' : ''} = 'Created', meta${ts ? `: ${metaType} | null` : ''} = null) {
    return ApiResponse.send(res, { statusCode: 201, data, message, meta });
  }

  static noContent(res${ts ? ': Response' : ''}) {
    return res.status(204).send();
  }
}

export default ApiResponse;
`;
}

function paginationFile(language) {
  const ts = isTS(language);
  return `${ts ? "import type { PaginationMeta } from '../types/api.js';\n\n" : ''}/**
 * pagination — query parsing + response meta shared by every repository
 * that exposes a findMany().
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function getPaginationParams(query${ts ? ': Record<string, unknown>' : ''} = {})${ts ? ': { page: number; limit: number; skip: number }' : ''} {
  const page = Math.max(parseInt(query.page${ts ? ' as string' : ''}, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(Math.max(parseInt(query.limit${ts ? ' as string' : ''}, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total${ts ? ': number' : ''}, page${ts ? ': number' : ''}, limit${ts ? ': number' : ''})${ts ? ': PaginationMeta' : ''} {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}
`;
}

function filterQueryFile(language) {
  const ts = isTS(language);
  return `/**
 * filterQuery — turns raw query params into a Mongo-ish filter object plus
 * pagination/sort options, restricted to an explicit allow-list so callers
 * can't filter on arbitrary/internal fields.
 */
import { getPaginationParams } from './pagination.js';

export function parseQueryParams(query${ts ? ': Record<string, unknown>' : ''} = {}, allowedFilters${ts ? ': string[]' : ''} = []) {
  const { page, limit, skip } = getPaginationParams(query);
  const sort = ${ts ? '(query.sort as string)' : 'query.sort'} || '-createdAt';

  const filters${ts ? ': Record<string, unknown>' : ''} = {};
  allowedFilters.forEach((key) => {
    if (query[key] !== undefined) filters[key] = query[key];
  });

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  return { filters, options: { page, limit, skip, sort } };
}
`;
}

function requestIdFile(language) {
  const ts = isTS(language);
  return `${ts ? "import type { Request, Response, NextFunction } from 'express';\n\n" : ''}/**
 * requestId — attaches a unique X-Request-Id to every request/response so
 * a single request can be traced across logs.
 */
import { randomUUID } from 'crypto';

export const requestId = (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  const incoming = req.headers['x-request-id'];
  req.requestId = ${ts ? '(Array.isArray(incoming) ? incoming[0] : incoming)' : 'incoming'} || randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

export default requestId;
`;
}

function loggerFile(language) {
  const ts = isTS(language);
  return `/**
 * logger — minimal leveled console logger. Swapped for Winston in the
 * integrations milestone; every module should import from here so that
 * swap only touches this file.
 */
const LEVELS = ['error', 'warn', 'info', 'debug']${ts ? ' as const' : ''};
${ts ? '\ntype LogLevel = typeof LEVELS[number];\n' : ''}
function log(level${ts ? ': LogLevel' : ''}, ...args${ts ? ': unknown[]' : ''}) {
  const timestamp = new Date().toISOString();
${ts ? '  const c = console as unknown as Record<string, (...a: unknown[]) => void>;\n  const method = c[level] ? level : \'log\';\n  c[method](`[${timestamp}] [${level.toUpperCase()}]`, ...args);' : `  const method = console[level] ? level : 'log';
  console[method](\`[\${timestamp}] [\${level.toUpperCase()}]\`, ...args);`}
}

export const logger = LEVELS.reduce((acc, level) => {
  acc[level] = (...args${ts ? ': unknown[]' : ''}) => log(level, ...args);
  return acc;
}, {}${ts ? ' as Record<LogLevel, (...args: unknown[]) => void>' : ''});

export default logger;
`;
}
