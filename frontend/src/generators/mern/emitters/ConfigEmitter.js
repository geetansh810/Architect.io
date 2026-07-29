import { fileExt, isTS } from '../utils/lang.js';

/**
 * ConfigEmitter — emits src/config/index.js (env validation) and
 * src/config/database.js (DB connect/disconnect with graceful shutdown).
 */
export function emitConfigFiles(analysis, language = 'javascript') {
  const { stats } = analysis;
  const ext = fileExt(language);
  const files = {
    [`src/config/index.${ext}`]: configIndexFile(stats, language),
    [`src/config/database.${ext}`]: databaseConfigFile(stats, language),
  };
  if (stats.hasCaching) {
    files[`src/config/redis.${ext}`] = redisConfigFile(language);
  }
  return files;
}

function configIndexFile(stats, language) {
  const ts = isTS(language);
  const requiredVars = ['PORT', 'NODE_ENV'];
  if (stats.dbCount > 0) requiredVars.push(stats.isPostgres ? 'DATABASE_URL' : 'MONGODB_URI');
  if (stats.hasAuth) requiredVars.push('JWT_SECRET');

  const configInterface = ts ? `interface AppConfig {
  env: string;
  port: number;
  corsOrigin: string;
${stats.dbCount > 0 ? (stats.isPostgres ? '  databaseUrl?: string;\n' : '  mongoUri?: string;\n') : ''}${stats.hasCaching ? '  redisUrl?: string;\n' : ''}${stats.hasAuth ? '  jwtSecret?: string;\n  jwtExpiresIn?: string;\n' : ''}}

` : '';

  return `/**
 * config — validates required environment variables on boot and exposes
 * a single typed config object. Fails fast instead of crashing deep
 * inside a request handler with "undefined is not a function".
 */
import dotenv from 'dotenv';

dotenv.config();

${configInterface}const REQUIRED_ENV_VARS = ${JSON.stringify(requiredVars, null, 2).replace(/\n/g, '\n  ')};

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(\`Missing required environment variables: \${missing.join(', ')}\`);
  }
}

validateEnv();

export const config${ts ? ': AppConfig' : ''} = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT${ts ? ' as string' : ''}, 10) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
${stats.dbCount > 0 ? (stats.isPostgres
    ? `  databaseUrl: process.env.DATABASE_URL,\n`
    : `  mongoUri: process.env.MONGODB_URI,\n`) : ''}${stats.hasCaching ? `  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',\n` : ''}${stats.hasAuth ? `  jwtSecret: process.env.JWT_SECRET,\n  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',\n` : ''}};

export default config;
`;
}

function databaseConfigFile(stats, language) {
  const ts = isTS(language);
  if (stats.dbCount === 0) {
    return `// No database node connected in this architecture.
export const connectDatabase = async ()${ts ? ': Promise<void>' : ''} => {};
export const disconnectDatabase = async ()${ts ? ': Promise<void>' : ''} => {};
`;
  }

  if (stats.isPostgres) {
    return `import { Pool } from 'pg';
import { config } from './index.js';
import { logger } from '../core/logger.js';

export const pool = new Pool({ connectionString: config.databaseUrl });

export const connectDatabase = async ()${ts ? ': Promise<void>' : ''} => {
  try {
    await pool.connect();
    logger.info('PostgreSQL connected');
  } catch (err) {
    logger.error('PostgreSQL connection error', err);
    process.exit(1);
  }
};

export const disconnectDatabase = async ()${ts ? ': Promise<void>' : ''} => {
  await pool.end();
  logger.info('PostgreSQL connection closed');
};

export default pool;
`;
  }

  return `import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../core/logger.js';

export const connectDatabase = async ()${ts ? ': Promise<void>' : ''} => {
  try {
    await mongoose.connect(config.mongoUri${ts ? ' as string' : ''});
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  }
};

export const disconnectDatabase = async ()${ts ? ': Promise<void>' : ''} => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
`;
}

function redisConfigFile(language) {
  const ts = isTS(language);
  return `import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from '../core/logger.js';

let redisClient${ts ? ': Redis | undefined' : ''};

export const connectRedis = ()${ts ? ': Redis' : ''} => {
  redisClient = new Redis(config.redisUrl${ts ? ' as string' : ''});

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error', err));

  return redisClient;
};

export const disconnectRedis = async ()${ts ? ': Promise<void>' : ''} => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

export const getRedisClient = () => redisClient;
`;
}
