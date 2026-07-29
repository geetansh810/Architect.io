import { fileExt, isTS } from '../utils/lang.js';
import { indentBlock } from '../utils/graph.js';

/**
 * MiddlewareEmitter — the src/middleware/ pipeline shared across all
 * modules: error handling, 404s, validation, auth, rate limiting, and
 * request logging.
 */
export function emitMiddlewareFiles(analysis, useJoi = false, language = 'javascript') {
  const ext = fileExt(language);
  const files = {
    [`src/middleware/errorHandler.${ext}`]: errorHandlerFile(language),
    [`src/middleware/notFound.${ext}`]: notFoundFile(language),
    [`src/middleware/validate.${ext}`]: useJoi ? validateFileJoi(language) : validateFileZod(language),
    [`src/middleware/requestLogger.${ext}`]: requestLoggerFile(language),
  };

  const usesAuth = analysis.stats.hasAuth || analysis.apiNodes.some((n) => n.data?.authEnabled);
  if (usesAuth) {
    files[`src/middleware/auth.${ext}`] = authFile(language);
    files[`src/middleware/authorize.${ext}`] = authorizeFile(language);
  }

  const rateLimiterNode = analysis.middlewareNodes.find((n) => n.data?.middlewareType === 'Rate Limiter');
  if (rateLimiterNode) {
    files[`src/middleware/rateLimiter.${ext}`] = rateLimiterFile(rateLimiterNode);
  }

  return files;
}

/**
 * emitCustomMiddlewareFiles — one file per "Custom" middlewareNode with
 * code written on the canvas. Returned separately from emitMiddlewareFiles
 * (rather than folded into its flat file map) because each file is owned
 * by a specific node, unlike the shared pipeline files above — the caller
 * needs the nodeId to keep the node<->file map accurate.
 */
export function emitCustomMiddlewareFiles(analysis, language = 'javascript') {
  const customNodes = analysis.middlewareNodes.filter(
    (n) => n.data?.middlewareType === 'Custom' && n.data?.code?.trim()
  );

  const ext = fileExt(language);
  return customNodes.map((node, i) => {
    const slug = `custom-middleware-${i + 1}`;
    const fnName = `customMiddleware${i + 1}`;
    return {
      nodeId: node.id,
      path: `src/middleware/custom/${slug}.${ext}`,
      content: customMiddlewareFile(fnName, node.data.code, language),
    };
  });
}

function customMiddlewareFile(fnName, code, language) {
  const ts = isTS(language);
  // User-authored code from the canvas is spliced in verbatim — it isn't
  // guaranteed to satisfy strict typing, so req/res/next are intentionally
  // loosely typed here rather than pulling in the shared Request/Response
  // generics used everywhere else.
  return `${ts ? "import type { Request, Response, NextFunction } from 'express';\n\n" : ''}/**
 * Custom middleware authored on the canvas (Middleware node, "Custom"
 * type). Not auto-mounted anywhere — import it and app.use() it, or
 * attach it to the specific router it belongs on.
 */
export const ${fnName} = (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
${indentBlock(code, 2)}
};
`;
}

function errorHandlerFile(language) {
  const ts = isTS(language);
  return `import { AppError } from '../core/AppError.js';
import { logger } from '../core/logger.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\n" : ''}
export const errorHandler = (err${ts ? ': Error & Partial<AppError>' : ''}, req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, _next${ts ? ': NextFunction' : ''}) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? (err.statusCode ?? 500) : 500;
  const message = isAppError ? err.message : 'Internal Server Error';

  if (!isAppError) {
    logger.error(\`Unhandled error [\${req.requestId}]\`, err);
  } else if (statusCode >= 500) {
    logger.error(\`\${err.name} [\${req.requestId}]\`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && !isAppError && { stack: err.stack }),
    meta: { requestId: req.requestId },
  });
};
`;
}

function notFoundFile(language) {
  const ts = isTS(language);
  return `import { NotFoundError } from '../core/AppError.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\n" : ''}
export const notFound = (req${ts ? ': Request' : ''}, _res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  next(new NotFoundError(\`Route \${req.method} \${req.originalUrl}\`));
};
`;
}

function validateFileZod(language) {
  const ts = isTS(language);
  return `import { ValidationError } from '../core/AppError.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\nimport type { ZodTypeAny } from 'zod';\n" : ''}
/**
 * validate(schema) — parses { body, query, params } against a Zod schema
 * and replaces req.body/query/params with the coerced, validated result.
 */
export const validate = (schema${ts ? ': ZodTypeAny' : ''}) => (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const errors = result.error.issues.map((issue${ts ? ': import(\'zod\').ZodIssue' : ''}) => ({
      field: issue.path.slice(1).join('.'),
      message: issue.message,
    }));
    return next(new ValidationError(errors));
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;
  Object.assign(req.query, result.data.query || {});
  next();
};
`;
}

function validateFileJoi(language) {
  const ts = isTS(language);
  return `import { ValidationError } from '../core/AppError.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\nimport type { ObjectSchema, ValidationErrorItem } from 'joi';\n" : ''}
/**
 * validate(schema) — parses { body, query, params } against a Joi schema
 * and replaces req.body/query/params with the coerced, validated result.
 */
export const validate = (schema${ts ? ': ObjectSchema' : ''}) => (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  const { error, value } = schema.validate(
    { body: req.body, query: req.query, params: req.params },
    { abortEarly: false, stripUnknown: false }
  );
  if (error) {
    const errors = error.details.map((detail${ts ? ': ValidationErrorItem' : ''}) => ({
      field: detail.path.slice(1).join('.'),
      message: detail.message,
    }));
    return next(new ValidationError(errors));
  }

  if (value.body) req.body = value.body;
  if (value.params) req.params = value.params;
  Object.assign(req.query, value.query || {});
  next();
};
`;
}

function requestLoggerFile(language) {
  const ts = isTS(language);
  return `import { logger } from '../core/logger.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\n" : ''}
export const requestLogger = (req${ts ? ': Request' : ''}, res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(\`\${req.method} \${req.originalUrl} \${res.statusCode} - \${duration}ms [\${req.requestId}]\`);
  });
  next();
};
`;
}

function authFile(language) {
  const ts = isTS(language);
  return `import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticationError } from '../core/AppError.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\nimport type { AuthUser } from '../types/express.js';\n" : ''}
export const auth = (req${ts ? ': Request' : ''}, _res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwtSecret${ts ? ' as string' : ''})${ts ? ' as unknown as AuthUser' : ''};
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired token'));
  }
};
`;
}

function authorizeFile(language) {
  const ts = isTS(language);
  return `import { ForbiddenError } from '../core/AppError.js';
${ts ? "import type { Request, Response, NextFunction } from 'express';\n" : ''}
/**
 * authorize('admin', 'editor') — role-gate a route. Must run after auth.
 */
export const authorize = (...roles${ts ? ': string[]' : ''}) => (req${ts ? ': Request' : ''}, _res${ts ? ': Response' : ''}, next${ts ? ': NextFunction' : ''}) => {
  if (!roles.includes(req.user?.role${ts ? ' as string' : ''})) {
    return next(new ForbiddenError());
  }
  next();
};
`;
}

function rateLimiterFile(node) {
  const windowMs = node?.data?.config?.windowMs ?? 900000;
  const max = node?.data?.config?.maxRequests ?? 100;
  return `import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: ${windowMs},
  max: ${max},
  standardHeaders: true,
  legacyHeaders: false,
});
`;
}
