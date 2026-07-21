/**
 * generators.js — Enterprise backend code generation.
 *
 * Produces a layered, production-oriented Express project:
 *   src/config       env-driven configuration, DB + Redis bootstrap
 *   src/models       Mongoose models (indexes, relations, clean JSON output)
 *   src/validations  express-validator rule sets derived from entity fields
 *   src/services     business layer — pagination, filtering, hooks, caching
 *   src/controllers  thin HTTP layer (asyncHandler + ApiError)
 *   src/routes       per-entity routers + versioned route index + health
 *   src/hooks        lifecycle business-logic hooks
 *   src/queues       BullMQ / Kafka workers
 *   src/jobs         node-cron scheduled jobs
 *   src/webhooks     signed webhook receivers
 *   Docker           Dockerfile + docker-compose with mongo/redis services
 *
 * The single entry point is buildProjectFiles(payload) which returns an
 * ordered { [path]: content } map used by both the ZIP download and the
 * code preview endpoint.
 */

const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const identifier = (s) => (s || '').replace(/[^A-Za-z0-9_]/g, '');
const serviceNameOf = (logic) => identifier(logic.name.replace(/\s+/g, '')) || 'CustomHook';

// ─────────────────────────────────────────────────────────────────────────────
// Feature detection
// ─────────────────────────────────────────────────────────────────────────────
function detectFeatures(payload) {
  const { apis = [], auth, caches = [], queues = [], mailer, storage = [], cronJobs = [], webhooks = [], middlewares = [] } = payload;
  return {
    hasAuth: !!auth || apis.some((a) => a.authEnabled),
    hasCache: caches.length > 0,
    hasQueue: queues.length > 0,
    hasBullQueue: queues.some((q) => !/kafka/i.test(q.broker || '')),
    hasKafka: queues.some((q) => /kafka/i.test(q.broker || '')),
    hasMailer: !!mailer,
    hasStorage: storage.length > 0,
    hasCron: cronJobs.length > 0,
    hasWebhooks: webhooks.length > 0,
    hasRateLimiter: middlewares.some((m) => m.middlewareType === 'Rate Limiter'),
    hasHttpLogger: middlewares.some((m) => m.middlewareType === 'Logger'),
    needsRedis: caches.length > 0 || queues.some((q) => !/kafka/i.test(q.broker || '')),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core infrastructure files
// ─────────────────────────────────────────────────────────────────────────────
const genConfig = (payload, f) => `require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/${kebab(payload.projectName || 'backendflow-app')}',
  },${f.hasAuth ? `
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRY || '${payload.auth?.expiry || '24h'}',
  },` : ''}${f.needsRedis ? `
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },` : ''}${f.hasCache ? `
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || ${payload.caches?.[0]?.ttl || 3600},
  },` : ''}${f.hasMailer ? `
  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || '${payload.mailer?.fromEmail || 'noreply@app.com'}',
  },` : ''}
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || ${payload.middlewares?.find((m) => m.middlewareType === 'Rate Limiter')?.config?.windowMs || 900000},
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || ${payload.middlewares?.find((m) => m.middlewareType === 'Rate Limiter')?.config?.maxRequests || 100},
  },
};

if (config.env === 'production'${f.hasAuth ? ' && !config.jwt.secret' : ' && false'}) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = config;
`;

const genDb = () => `const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectDB(retries = MAX_RETRIES) {
  try {
    await mongoose.connect(config.db.uri, { autoIndex: config.env !== 'production' });
    logger.info('MongoDB connected');
  } catch (err) {
    if (retries > 0) {
      logger.warn(\`MongoDB connection failed (\${err.message}) — retrying in \${RETRY_DELAY_MS / 1000}s (\${retries} left)\`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    logger.error('MongoDB connection failed permanently', err);
    throw err;
  }
}

module.exports = { connectDB };
`;

const genRedis = () => `const { createClient } = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

const redisClient = createClient({ url: config.redis.url });

redisClient.on('error', (err) => logger.error('Redis error: ' + err.message));
redisClient.on('connect', () => logger.info('Redis connected'));

async function connectRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
  return redisClient;
}

module.exports = { redisClient, connectRedis };
`;

const genLogger = () => `const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.printf(
          ({ level, message, timestamp, stack }) => \`\${timestamp} \${level}: \${stack || message}\`
        ))
  ),
  transports: [new winston.transports.Console()],
});

logger.stream = { write: (msg) => logger.info(msg.trim()) };

module.exports = logger;
`;

const genApiError = () => `class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) { return new ApiError(400, message, details); }
  static unauthorized(message = 'Not authenticated') { return new ApiError(401, message); }
  static forbidden(message = 'Forbidden') { return new ApiError(403, message); }
  static notFound(message = 'Resource not found') { return new ApiError(404, message); }
  static conflict(message) { return new ApiError(409, message); }
}

module.exports = ApiError;
`;

const genAsyncHandler = () => `/** Wrap async route handlers so rejections reach the error middleware. */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
`;

const genErrorHandler = () => `const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// 404 for unmatched routes
exports.notFound = (req, res, next) => {
  next(ApiError.notFound(\`Route \${req.method} \${req.originalUrl} not found\`));
};

// Central error handler — keep last in the middleware chain
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, details } = err;

  // Mongoose validation / cast / duplicate-key errors → 4xx
  if (err.name === 'ValidationError') {
    statusCode = 422;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = \`Invalid \${err.path}: \${err.value}\`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = \`Duplicate value for unique field: \${Object.keys(err.keyValue || {}).join(', ')}\`;
  }

  if (statusCode >= 500) {
    logger.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  });
};
`;

const genValidateMiddleware = () => `const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** Run an array of express-validator chains and 422 on failure. */
module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(422, 'Validation failed', errors.array().map((e) => \`\${e.path}: \${e.msg}\`)));
    }
    next();
  },
];
`;

const genAuthMiddleware = () => `const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }
    const decoded = jwt.verify(header.split(' ')[1], config.jwt.secret || 'dev_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw ApiError.unauthorized('User no longer exists');
    req.user = user;
    next();
  } catch (err) {
    next(err.isOperational ? err : ApiError.unauthorized('Invalid or expired token'));
  }
};

/** Role-based guard: authorize('admin'), authorize('admin', 'manager') */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
  next();
};
`;

const genCacheMiddleware = () => `const { redisClient } = require('../config/redis');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Cache-aside middleware for GET endpoints. Keys are namespaced per entity so
 * mutations can invalidate a whole namespace at once.
 */
exports.cache = (namespace, ttl = config.cache.ttlSeconds) => async (req, res, next) => {
  if (!redisClient.isOpen) return next();
  const key = \`cache:\${namespace}:\${req.originalUrl}\`;
  try {
    const hit = await redisClient.get(key);
    if (hit) {
      res.set('X-Cache', 'HIT');
      return res.json(JSON.parse(hit));
    }
  } catch (err) {
    logger.warn('Cache read failed: ' + err.message);
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      redisClient.setEx(key, ttl, JSON.stringify(body)).catch((err) => logger.warn('Cache write failed: ' + err.message));
    }
    res.set('X-Cache', 'MISS');
    return originalJson(body);
  };
  next();
};

exports.invalidate = async (namespace) => {
  if (!redisClient.isOpen) return;
  try {
    for await (const key of redisClient.scanIterator({ MATCH: \`cache:\${namespace}:*\`, COUNT: 100 })) {
      await redisClient.del(key);
    }
  } catch (err) {
    logger.warn('Cache invalidation failed: ' + err.message);
  }
};
`;

const genRateLimiter = (mw) => `const rateLimit = require('express-rate-limit');
const config = require('../config');

module.exports = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
`;

const genMailer = (mailer) => `const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.port === 465,
  auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
});

exports.sendMail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({ from: config.mail.from, to, subject, html, text });
  logger.info(\`Mail sent to \${to}: \${info.messageId}\`);
  return info;
};
`;

const genStorageMiddleware = (storage, index) => {
  const types = storage.allowedTypes || ['images'];
  const mimeMap = {
    images: "image/", documents: "application/pdf", videos: "video/",
  };
  const accepted = types.map((t) => mimeMap[t] || t).filter(Boolean);
  return `const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, \`\${Date.now()}-\${unique}\${path.extname(file.originalname)}\`);
  },
});

const ACCEPTED_PREFIXES = ${JSON.stringify(accepted)};

module.exports = multer({
  storage,
  limits: { fileSize: ${storage.maxSizeMB || 5} * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ACCEPTED_PREFIXES.some((p) => file.mimetype.startsWith(p))) return cb(null, true);
    cb(new ApiError(415, \`Unsupported file type: \${file.mimetype}\`));
  },
});
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Entity layer: model → validation → service → controller → routes
// ─────────────────────────────────────────────────────────────────────────────
export const generateModel = (entity, relationships = []) => {
  const lines = (entity.fields || []).map((f) => {
    const type = { number: 'Number', boolean: 'Boolean', date: 'Date' }[f.type] || 'String';
    const opts = [`type: ${type}`, `required: ${f.required ? 'true' : 'false'}`];
    if (f.unique) opts.push('unique: true');
    if (type === 'String') opts.push('trim: true');
    return `    ${f.name}: { ${opts.join(', ')} }`;
  });

  relationships.forEach((rel) => {
    if (rel.type === 'N:M') {
      lines.push(`    ${rel.foreignKey}: [{ type: mongoose.Schema.Types.ObjectId, ref: '${rel.refEntity}', index: true }]`);
    } else {
      lines.push(`    ${rel.foreignKey}: { type: mongoose.Schema.Types.ObjectId, ref: '${rel.refEntity}', index: true }`);
    }
  });

  return `const mongoose = require('mongoose');

const ${entity.name}Schema = new mongoose.Schema(
  {
${lines.join(',\n')}
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('${entity.name}', ${entity.name}Schema);
`;
};

export const generateValidation = (entity) => {
  const chains = (entity.fields || []).map((f) => {
    let chain = `body('${f.name}')`;
    const typeCheck = {
      string: `.isString().withMessage('must be a string')`,
      number: `.isNumeric().withMessage('must be a number')`,
      boolean: `.isBoolean().withMessage('must be a boolean')`,
      date: `.isISO8601().withMessage('must be an ISO-8601 date')`,
    }[f.type] || `.isString()`;
    chain += f.required
      ? `.exists({ checkNull: true }).withMessage('is required')${typeCheck}`
      : `.optional()${typeCheck}`;
    return `  ${chain}`;
  });

  const updateChains = (entity.fields || []).map((f) => {
    const typeCheck = {
      string: `.isString()`, number: `.isNumeric()`, boolean: `.isBoolean()`, date: `.isISO8601()`,
    }[f.type] || `.isString()`;
    return `  body('${f.name}').optional()${typeCheck}`;
  });

  return `const { body, param, query } = require('express-validator');

exports.create${entity.name} = [
${chains.join(',\n') || '  // no fields defined'}
];

exports.update${entity.name} = [
  param('id').isMongoId().withMessage('invalid id'),
${updateChains.join(',\n') || '  // no fields defined'}
];

exports.byId = [param('id').isMongoId().withMessage('invalid id')];

exports.list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sort').optional().isString(),
];
`;
};

export const generateService = (entity, api = {}, relationships = [], features = {}) => {
  const name = entity.name;
  const varName = lc(name);
  const logic = api.logic || [];
  const hooks = {};
  logic.forEach((l) => {
    (hooks[l.hook] = hooks[l.hook] || []).push(serviceNameOf(l));
  });
  const hookImports = [...new Set(logic.map(serviceNameOf))]
    .map((s) => `const ${s} = require('../hooks/${s}');`).join('\n');

  const runHooks = (hook, arg) =>
    (hooks[hook] || []).map((s) => `    await ${s}.execute(${arg});`).join('\n');

  const populate = relationships.map((r) => `.populate('${r.foreignKey}')`).join('');
  const cacheImport = features.hasCache ? `const { invalidate } = require('../middlewares/cache');\n` : '';
  const invalidateCall = features.hasCache ? `\n    await invalidate('${varName}');` : '';
  const searchableFields = (entity.fields || []).filter((f) => f.type === 'string').map((f) => f.name);

  return `const ${name} = require('../models/${name}');
const ApiError = require('../utils/ApiError');
${cacheImport}${hookImports}${hookImports ? '\n' : ''}
const SEARCHABLE_FIELDS = ${JSON.stringify(searchableFields)};
const FILTERABLE_FIELDS = ${JSON.stringify((entity.fields || []).map((f) => f.name))};

/**
 * List with pagination, sorting, field filtering and free-text search.
 * Query params: page, limit, sort (e.g. "-createdAt"), q, plus any entity field.
 */
exports.list = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const sort = query.sort || '-createdAt';

  const filter = {};
  FILTERABLE_FIELDS.forEach((f) => {
    if (query[f] !== undefined) filter[f] = query[f];
  });
  if (query.q && SEARCHABLE_FIELDS.length > 0) {
    filter.$or = SEARCHABLE_FIELDS.map((f) => ({ [f]: { $regex: query.q, $options: 'i' } }));
  }

  const [items, total] = await Promise.all([
    ${name}.find(filter).sort(sort).skip((page - 1) * limit).limit(limit)${populate},
    ${name}.countDocuments(filter),
  ]);

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

exports.getById = async (id) => {
  const doc = await ${name}.findById(id)${populate};
  if (!doc) throw ApiError.notFound('${name} not found');
  return doc;
};

exports.create = async (payload) => {
${runHooks('before-create', 'payload') || '  // no before-create hooks'}
  const doc = await ${name}.create(payload);
${runHooks('after-create', 'doc') || '  // no after-create hooks'}${invalidateCall}
  return doc;
};

exports.update = async (id, payload) => {
${runHooks('before-update', 'payload') || '  // no before-update hooks'}
  const doc = await ${name}.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!doc) throw ApiError.notFound('${name} not found');
${runHooks('after-update', 'doc') || '  // no after-update hooks'}${invalidateCall}
  return doc;
};

exports.remove = async (id) => {
${runHooks('before-delete', 'id') || '  // no before-delete hooks'}
  const doc = await ${name}.findByIdAndDelete(id);
  if (!doc) throw ApiError.notFound('${name} not found');
${runHooks('after-delete', 'doc') || '  // no after-delete hooks'}${invalidateCall}
  return doc;
};
`;
};

export const generateController = (entity) => {
  const name = entity.name;
  const varName = lc(name);
  return `const asyncHandler = require('../utils/asyncHandler');
const ${varName}Service = require('../services/${varName}.service');

exports.list = asyncHandler(async (req, res) => {
  const { items, meta } = await ${varName}Service.list(req.query);
  res.json({ success: true, data: items, meta });
});

exports.getById = asyncHandler(async (req, res) => {
  const doc = await ${varName}Service.getById(req.params.id);
  res.json({ success: true, data: doc });
});

exports.create = asyncHandler(async (req, res) => {
  const doc = await ${varName}Service.create(req.body);
  res.status(201).json({ success: true, data: doc });
});

exports.update = asyncHandler(async (req, res) => {
  const doc = await ${varName}Service.update(req.params.id, req.body);
  res.json({ success: true, data: doc });
});

exports.remove = asyncHandler(async (req, res) => {
  await ${varName}Service.remove(req.params.id);
  res.json({ success: true, message: '${name} deleted' });
});
`;
};

export const generateRoutes = (api, entity, features = {}) => {
  const name = entity.name;
  const varName = lc(name);
  const useAuth = !!api.authEnabled;
  const useCache = !!features.hasCache;

  const imports = [
    `const express = require('express');`,
    `const controller = require('../controllers/${varName}.controller');`,
    `const validate = require('../middlewares/validate');`,
    `const rules = require('../validations/${varName}.validation');`,
  ];
  if (useAuth) imports.push(`const { protect } = require('../middlewares/auth');`);
  if (useCache) imports.push(`const { cache } = require('../middlewares/cache');`);

  const guard = useAuth ? 'protect, ' : '';
  const listMw = `${guard}${useCache ? `cache('${varName}'), ` : ''}validate(rules.list)`;
  const getMw = `${guard}${useCache ? `cache('${varName}'), ` : ''}validate(rules.byId)`;

  return `${imports.join('\n')}

const router = express.Router();

router.get('/', ${listMw}, controller.list);
router.get('/:id', ${getMw}, controller.getById);
router.post('/', ${guard}validate(rules.create${name}), controller.create);
router.put('/:id', ${guard}validate(rules.update${name}), controller.update);
router.delete('/:id', ${guard}validate(rules.byId), controller.remove);

module.exports = router;
`;
};

export const generateRouteIndex = (apis, features) => {
  const imports = apis.map((a) => `const ${lc(a.entityName)}Routes = require('./${lc(a.entityName)}.routes');`);
  const mounts = apis.map((a) => `router.use('${a.route}', ${lc(a.entityName)}Routes);`);
  if (features.hasAuth) {
    imports.unshift(`const authRoutes = require('./auth.routes');`);
    mounts.unshift(`router.use('/auth', authRoutes);`);
  }
  return `const express = require('express');
${imports.join('\n')}

const router = express.Router();

// Liveness / readiness probe
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

${mounts.join('\n')}

module.exports = router;
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth module
// ─────────────────────────────────────────────────────────────────────────────
const genUserModel = () => `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
`;

const genAuthController = () => `const jwt = require('jsonwebtoken');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwt.secret || 'dev_secret', { expiresIn: config.jwt.expiresIn });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Email already registered');
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, data: { user, token: signToken(user) } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  res.json({ success: true, data: { user, token: signToken(user) } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
`;

const genAuthRoutes = () => `const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', validate([
  body('name').isString().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('must be at least 8 characters'),
]), controller.register);

router.post('/login', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
]), controller.login);

router.get('/me', protect, controller.me);

module.exports = router;
`;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks, jobs, queues, webhooks
// ─────────────────────────────────────────────────────────────────────────────
export const generateHook = (logicNode) => `const logger = require('../utils/logger');

/**
 * Lifecycle hook: ${logicNode.name} (${logicNode.hook})
 * Called from the owning entity's service layer.
 */
exports.execute = async (data) => {
  logger.info('Hook "${logicNode.name}" executing');
  // TODO: implement "${logicNode.name}" business logic
  return data;
};
`;

export const generateCronJob = (job) => `const cron = require('node-cron');
const logger = require('../utils/logger');

/** Scheduled job: ${job.jobName} — "${job.schedule || '0 0 * * *'}" */
function register() {
  cron.schedule('${job.schedule || '0 0 * * *'}', async () => {
    const startedAt = Date.now();
    logger.info('Job ${job.jobName} started');
    try {
      // TODO: implement ${job.jobName}
      logger.info(\`Job ${job.jobName} finished in \${Date.now() - startedAt}ms\`);
    } catch (err) {
      logger.error('Job ${job.jobName} failed', err);
    }
  });
}

module.exports = { register };
`;

const genBullQueue = (q) => `const { Queue } = require('bullmq');
const config = require('../config');

const connection = { url: config.redis.url };

/** Producer for the "${q.topic}" queue. */
const ${identifier(q.topic) || 'jobs'}Queue = new Queue('${q.topic}', { connection });

exports.enqueue = (name, payload, opts = {}) =>
  ${identifier(q.topic) || 'jobs'}Queue.add(name, payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
    ...opts,
  });

exports.queue = ${identifier(q.topic) || 'jobs'}Queue;
`;

const genBullWorker = (q) => `const { Worker } = require('bullmq');
const config = require('../config');
const logger = require('../utils/logger');

const connection = { url: config.redis.url };

/** Consumer for the "${q.topic}" queue (group: ${q.consumerGroup || 'workers'}). */
function start() {
  const worker = new Worker('${q.topic}', async (job) => {
    logger.info(\`Processing \${job.name} #\${job.id}\`);
    // TODO: handle job.data for the "${q.topic}" queue
  }, { connection, concurrency: 5 });

  worker.on('failed', (job, err) => logger.error(\`Job \${job?.id} failed: \${err.message}\`));
  return worker;
}

module.exports = { start };
`;

const genKafkaQueue = (q) => `const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

const kafka = new Kafka({
  clientId: 'app',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: '${q.consumerGroup || 'workers'}' });

exports.publish = async (message) => {
  await producer.connect();
  await producer.send({ topic: '${q.topic}', messages: [{ value: JSON.stringify(message) }] });
};

exports.startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: '${q.topic}', fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      logger.info('Consumed message from ${q.topic}');
      // TODO: handle payload
    },
  });
};
`;

export const generateWebhook = (webhook) => `const express = require('express');
const crypto = require('crypto');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * ${webhook.direction || 'Incoming'} webhook — ${webhook.provider}
 * Mounted with express.raw() so the signature is verified on the exact bytes.
 */
router.post('${webhook.path || '/webhooks'}', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] || req.headers['stripe-signature'];
  const secret = process.env.WEBHOOK_SECRET_${identifier((webhook.provider || 'GENERIC').toUpperCase())};

  if (secret) {
    const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (!signature || !crypto.timingSafeEqual(Buffer.from(String(signature).slice(0, expected.length).padEnd(expected.length)), Buffer.from(expected))) {
      logger.warn('${webhook.provider} webhook signature verification failed');
      return res.status(400).json({ received: false, error: 'Invalid signature' });
    }
  }

  const event = JSON.parse(req.body.toString());
  logger.info(\`${webhook.provider} webhook event: \${event.type || 'unknown'}\`);
  // TODO: route the event to the right handler / queue

  res.status(200).json({ received: true });
});

module.exports = router;
`;

// ─────────────────────────────────────────────────────────────────────────────
// App wiring
// ─────────────────────────────────────────────────────────────────────────────
export const generateAppJs = (payload, f) => {
  const { webhooks = [], middlewares = [], storage = [] } = payload;

  const webhookLines = webhooks.map((w, i) =>
    `app.use(require('./webhooks/${identifier((w.provider || 'generic').toLowerCase()) || 'generic'}${i}.webhook'));`);

  const customMwLines = [];
  if (f.hasRateLimiter) customMwLines.push(`app.use('/api', require('./middlewares/rateLimiter'));`);

  return `const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ── Security & platform middleware ──
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

// ── Webhooks (raw body — must come before express.json) ──
${webhookLines.join('\n') || '// none configured'}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
${f.hasStorage ? `app.use('/uploads', express.static('uploads'));` : ''}

${customMwLines.join('\n')}

// ── API v1 ──
app.use('/api/v1', routes);

// ── 404 + central error handling ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;
`;
};

export const generateServerJs = (payload, f) => {
  const { cronJobs = [], queues = [] } = payload;
  const jobRequires = cronJobs.map((c, i) => `  require('./jobs/${identifier(c.jobName) || `job${i}`}.job').register();`);
  const workerRequires = queues.map((q, i) => {
    if (/kafka/i.test(q.broker || '')) return `  require('./queues/${identifier(q.topic) || `queue${i}`}.queue').startConsumer().catch((err) => logger.error(err));`;
    return `  require('./queues/${identifier(q.topic) || `queue${i}`}.worker').start();`;
  });

  return `const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');
${f.needsRedis ? `const { connectRedis } = require('./config/redis');` : ''}

let server;

async function start() {
  await connectDB();
${f.needsRedis ? `  await connectRedis().catch((err) => logger.warn('Redis unavailable at boot: ' + err.message));` : ''}

  // Scheduled jobs
${jobRequires.join('\n') || '  // none'}

  // Queue workers
${workerRequires.join('\n') || '  // none'}

  server = app.listen(config.port, () => {
    logger.info(\`Server listening on port \${config.port} (\${config.env})\`);
  });
}

function shutdown(signal) {
  logger.info(\`\${signal} received — shutting down gracefully\`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', err);
  shutdown('unhandledRejection');
});

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Project meta files
// ─────────────────────────────────────────────────────────────────────────────
export const generatePackageJson = (payload, f) => {
  const deps = {
    compression: '^1.7.4',
    cors: '^2.8.5',
    dotenv: '^16.4.5',
    express: '^4.19.2',
    'express-validator': '^7.1.0',
    helmet: '^7.1.0',
    mongoose: '^8.4.0',
    morgan: '^1.10.0',
    winston: '^3.13.0',
  };
  if (f.hasAuth) { deps.jsonwebtoken = '^9.0.2'; deps.bcryptjs = '^2.4.3'; }
  if (f.hasRateLimiter) deps['express-rate-limit'] = '^7.2.0';
  if (f.hasStorage) deps.multer = '^1.4.5-lts.1';
  if (f.hasCron) deps['node-cron'] = '^3.0.3';
  if (f.needsRedis) deps.redis = '^4.6.13';
  if (f.hasBullQueue) deps.bullmq = '^5.7.0';
  if (f.hasKafka) deps.kafkajs = '^2.2.4';
  if (f.hasMailer) deps.nodemailer = '^6.9.13';

  return JSON.stringify({
    name: kebab(payload.projectName || 'generated-backend'),
    version: '1.0.0',
    description: 'Generated with BackendFlow',
    main: 'src/server.js',
    scripts: {
      start: 'node src/server.js',
      dev: 'nodemon src/server.js',
      lint: 'eslint src',
    },
    dependencies: Object.fromEntries(Object.entries(deps).sort()),
    devDependencies: { nodemon: '^3.1.0' },
    engines: { node: '>=18' },
  }, null, 2) + '\n';
};

export const generateEnv = (payload, f) => {
  const { database, auth, webhooks = [] } = payload;
  const dbUri = database?.uri || `mongodb://localhost:27017/${kebab(payload.projectName || 'generated-app')}`;
  const lines = [
    'NODE_ENV=development',
    'PORT=5000',
    `DB_URI=${dbUri}`,
    'CORS_ORIGIN=*',
    'LOG_LEVEL=info',
  ];
  if (f.hasAuth) {
    lines.push(`JWT_SECRET=${auth?.secret || 'change-me-to-a-long-random-string'}`, `JWT_EXPIRY=${auth?.expiry || '24h'}`);
  }
  if (f.needsRedis) lines.push('REDIS_URL=redis://localhost:6379');
  if (f.hasCache) lines.push(`CACHE_TTL_SECONDS=${payload.caches?.[0]?.ttl || 3600}`);
  if (f.hasKafka) lines.push('KAFKA_BROKERS=localhost:9092');
  if (f.hasMailer) {
    lines.push('SMTP_HOST=smtp.example.com', 'SMTP_PORT=587', 'SMTP_USER=', 'SMTP_PASS=', `MAIL_FROM=${payload.mailer?.fromEmail || 'noreply@app.com'}`);
  }
  webhooks.forEach((w) => {
    lines.push(`WEBHOOK_SECRET_${identifier((w.provider || 'GENERIC').toUpperCase())}=`);
  });
  lines.push(`RATE_LIMIT_WINDOW_MS=${payload.middlewares?.find((m) => m.middlewareType === 'Rate Limiter')?.config?.windowMs || 900000}`);
  lines.push(`RATE_LIMIT_MAX=${payload.middlewares?.find((m) => m.middlewareType === 'Rate Limiter')?.config?.maxRequests || 100}`);
  return lines.join('\n') + '\n';
};

const genDockerfile = () => `FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

USER node
CMD ["node", "src/server.js"]
`;

const genDockerCompose = (payload, f) => {
  const services = [`  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_URI=mongodb://mongo:27017/${kebab(payload.projectName || 'app')}${f.needsRedis ? `
      - REDIS_URL=redis://redis:6379` : ''}${f.hasAuth ? `
      - JWT_SECRET=\${JWT_SECRET:?set JWT_SECRET in your shell or .env}` : ''}
    depends_on:
      - mongo${f.needsRedis ? `
      - redis` : ''}
    restart: unless-stopped`];

  services.push(`  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped`);

  if (f.needsRedis) {
    services.push(`  redis:
    image: redis:7-alpine
    restart: unless-stopped`);
  }

  return `services:
${services.join('\n\n')}

volumes:
  mongo-data:
`;
};

const genDockerignore = () => `node_modules
npm-debug.log
.env
uploads
*.md
`;

const genReadme = (payload, f) => {
  const { entities = [], apis = [] } = payload;
  const endpointRows = apis.map((a) => `| \`${a.route}\` | ${a.entityName} | ${a.authEnabled ? '🔒 JWT' : 'Public'} |`).join('\n');
  return `# ${payload.projectName || 'Generated Backend'}

Production-grade Express + MongoDB backend generated with **BackendFlow**.

## Stack
- Express 4 with Helmet, CORS, compression and structured Winston logging
- MongoDB via Mongoose (retrying connection bootstrap)${f.hasCache ? '\n- Redis cache-aside layer with automatic invalidation on writes' : ''}${f.hasAuth ? '\n- JWT authentication with bcrypt password hashing and role-based guards' : ''}${f.hasQueue ? '\n- Background job queues with retry/backoff' : ''}${f.hasCron ? '\n- node-cron scheduled jobs' : ''}${f.hasWebhooks ? '\n- HMAC-verified webhook receivers' : ''}
- Request validation (express-validator), central error handling, graceful shutdown

## Quick start
\`\`\`bash
cp .env.example .env   # fill in secrets
npm install
npm run dev
\`\`\`

Or with Docker:
\`\`\`bash
docker compose up --build
\`\`\`

## API (mounted at /api/v1)
| Base route | Entity | Auth |
|---|---|---|
${endpointRows || '| — | — | — |'}

Each entity route exposes: \`GET /\` (paginated list: \`?page&limit&sort&q\`), \`GET /:id\`, \`POST /\`, \`PUT /:id\`, \`DELETE /:id\`.
${f.hasAuth ? '\nAuth endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.\n' : ''}
Health probe: \`GET /api/v1/health\`.

## Data models
${entities.map((e) => `- **${e.name}**: ${(e.fields || []).map((fl) => `${fl.name}:${fl.type}${fl.required ? '*' : ''}`).join(', ') || 'no fields'}`).join('\n')}
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export function buildProjectFiles(payload) {
  const f = detectFeatures(payload);
  const files = {};

  // The auth module owns the "User" model — namespace any user-defined
  // entity called "User" so the two never collide.
  if (f.hasAuth && (payload.entities || []).some((e) => e.name === 'User')) {
    const rename = (n) => (n === 'User' ? 'UserProfile' : n);
    payload = {
      ...payload,
      entities: (payload.entities || []).map((e) => ({ ...e, name: rename(e.name) })),
      apis: (payload.apis || []).map((a) => ({ ...a, entityName: rename(a.entityName) })),
      relationships: (payload.relationships || []).map((r) => ({
        ...r, sourceEntity: rename(r.sourceEntity), refEntity: rename(r.refEntity),
      })),
    };
  }

  const {
    entities = [], apis = [], middlewares = [], storage = [],
    cronJobs = [], webhooks = [], queues = [], relationships = [],
  } = payload;

  // Infra
  files['src/config/index.js'] = genConfig(payload, f);
  files['src/config/db.js'] = genDb();
  if (f.needsRedis) files['src/config/redis.js'] = genRedis();
  files['src/utils/logger.js'] = genLogger();
  files['src/utils/ApiError.js'] = genApiError();
  files['src/utils/asyncHandler.js'] = genAsyncHandler();
  if (f.hasMailer) files['src/utils/mailer.js'] = genMailer(payload.mailer);
  files['src/middlewares/errorHandler.js'] = genErrorHandler();
  files['src/middlewares/validate.js'] = genValidateMiddleware();
  if (f.hasAuth) files['src/middlewares/auth.js'] = genAuthMiddleware();
  if (f.hasCache) files['src/middlewares/cache.js'] = genCacheMiddleware();
  if (f.hasRateLimiter) files['src/middlewares/rateLimiter.js'] = genRateLimiter(middlewares.find((m) => m.middlewareType === 'Rate Limiter'));
  storage.forEach((s, i) => {
    files[`src/middlewares/upload${i === 0 ? '' : i}.js`] = genStorageMiddleware(s, i);
  });

  // Auth module
  if (f.hasAuth) {
    files['src/models/User.js'] = genUserModel();
    files['src/controllers/auth.controller.js'] = genAuthController();
    files['src/routes/auth.routes.js'] = genAuthRoutes();
  }

  // Entity layer
  const hookFilesWritten = new Set();
  entities.forEach((entity) => {
    if (!entity?.name) return;
    const rels = relationships.filter((r) => r.sourceEntity === entity.name);
    const api = apis.find((a) => a.entityName === entity.name);
    const varName = lc(entity.name);

    files[`src/models/${entity.name}.js`] = generateModel(entity, rels);
    files[`src/validations/${varName}.validation.js`] = generateValidation(entity);
    files[`src/services/${varName}.service.js`] = generateService(entity, api || {}, rels, f);
    files[`src/controllers/${varName}.controller.js`] = generateController(entity);
    if (api) {
      files[`src/routes/${varName}.routes.js`] = generateRoutes(api, entity, f);
      (api.logic || []).forEach((logicNode) => {
        const hookName = serviceNameOf(logicNode);
        if (!hookFilesWritten.has(hookName)) {
          files[`src/hooks/${hookName}.js`] = generateHook(logicNode);
          hookFilesWritten.add(hookName);
        }
      });
    }
  });

  files['src/routes/index.js'] = generateRouteIndex(apis.filter((a) => entities.some((e) => e.name === a.entityName)), f);

  // Async infra
  cronJobs.forEach((c, i) => {
    files[`src/jobs/${identifier(c.jobName) || `job${i}`}.job.js`] = generateCronJob(c);
  });
  queues.forEach((q, i) => {
    const base = identifier(q.topic) || `queue${i}`;
    if (/kafka/i.test(q.broker || '')) {
      files[`src/queues/${base}.queue.js`] = genKafkaQueue(q);
    } else {
      files[`src/queues/${base}.queue.js`] = genBullQueue(q);
      files[`src/queues/${base}.worker.js`] = genBullWorker(q);
    }
  });
  webhooks.forEach((w, i) => {
    files[`src/webhooks/${identifier((w.provider || 'generic').toLowerCase()) || 'generic'}${i}.webhook.js`] = generateWebhook(w);
  });

  // App shell
  files['src/app.js'] = generateAppJs(payload, f);
  files['src/server.js'] = generateServerJs(payload, f);

  // Meta
  files['package.json'] = generatePackageJson(payload, f);
  files['.env.example'] = generateEnv(payload, f);
  files['.env'] = generateEnv(payload, f);
  files['Dockerfile'] = genDockerfile();
  files['docker-compose.yml'] = genDockerCompose(payload, f);
  files['.dockerignore'] = genDockerignore();
  files['README.md'] = payload.documentation || genReadme(payload, f);

  return files;
}
