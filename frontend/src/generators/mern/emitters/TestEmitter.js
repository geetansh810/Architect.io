import { toPascalCase, toCamelCase, toKebabCase } from '../utils/naming.js';
import { isEmailField, isPasswordField } from '../utils/fieldHeuristics.js';
import { fileExt, isTS } from '../utils/lang.js';

/**
 * TestEmitter — tests/setup.js, a per-entity Supertest smoke test, and a
 * plain-object data factory. Enough to prove the generated project boots
 * and its CRUD surface responds; not a substitute for real test coverage.
 */
export function emitTestFiles(analysis, apiEntities, language = 'javascript') {
  const ext = fileExt(language);
  const files = {
    [`tests/setup.${ext}`]: setupFile(analysis, language),
    'jest.config.js': jestConfigFile(language),
  };

  apiEntities.forEach((entity) => {
    const kebabName = toKebabCase(entity.data?.name || entity.id);
    files[`tests/factories/${kebabName}.factory.${ext}`] = factoryFile(entity, language);
    files[`src/modules/${kebabName}/${kebabName}.test.${ext}`] = testFile(entity, kebabName);
  });

  return files;
}

function jestConfigFile(language) {
  const ts = isTS(language);
  if (!ts) {
    return `export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: { branches: 40, functions: 40, lines: 40, statements: 40 },
  },
};
`;
  }
  return `export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: { '^.+\\\\.ts$': ['ts-jest', { useESM: true }] },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  coverageThreshold: {
    global: { branches: 40, functions: 40, lines: 40, statements: 40 },
  },
};
`;
}

function setupFile(analysis, language) {
  const ts = isTS(language);
  if (!analysis.stats.dbCount || !analysis.stats.isMongo) {
    return `// No MongoDB node on the canvas — nothing to spin up for tests.
export {};
`;
  }

  return `import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod${ts ? ': MongoMemoryServer' : ''};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db${ts ? '!' : ''}.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});
`;
}

function factoryFile(entity, language) {
  const ts = isTS(language);
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const kebabName = toKebabCase(entity.data?.name || entity.id);
  const fields = entity.data?.fields || [];
  const sample = fields.map((f) => `  ${f.name}: ${sampleValue(f)},`).join('\n');

  return `${ts ? `import type { Create${pascalName}Input } from '../../src/modules/${kebabName}/${kebabName}.types.js';\n\n` : ''}// Plain-object test data factory for ${entity.data?.name || entity.id}.
export function build${pascalName}(overrides${ts ? `: Partial<Create${pascalName}Input>` : ''} = {})${ts ? `: Create${pascalName}Input` : ''} {
  return {
${sample || '    // Add sample fields here'}
    ...overrides,
  }${ts ? ` as Create${pascalName}Input` : ''};
}
`;
}

function sampleValue(field) {
  switch (field.type) {
    case 'number': return '1';
    case 'boolean': return 'true';
    case 'date': return 'new Date().toISOString()';
    default:
      if (isEmailField(field)) return "'test@example.com'";
      if (isPasswordField(field)) return "'Sup3rSecret!'";
      return `'sample-${field.name}'`;
  }
}

function testFile(entity, kebabName) {
  const pascalName = toPascalCase(entity.data?.name || entity.id);
  const camelName = toCamelCase(entity.data?.name || entity.id);
  const hasRequiredField = (entity.data?.fields || []).some((f) => f.required);

  return `import request from 'supertest';
import app from '../../server.js';
import { build${pascalName} } from '../../../tests/factories/${kebabName}.factory.js';

describe('${pascalName} API', () => {
  it('creates and retrieves a ${camelName}', async () => {
    const payload = build${pascalName}();

    const createRes = await request(app).post('/api/v1/${kebabName}').send(payload);
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const id = createRes.body.data._id || createRes.body.data.id;
    const getRes = await request(app).get(\`/api/v1/${kebabName}/\${id}\`);
    expect(getRes.status).toBe(200);
  });

  it('lists ${camelName}s', async () => {
    const res = await request(app).get('/api/v1/${kebabName}');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
${hasRequiredField ? `
  it('rejects a payload missing required fields', async () => {
    const res = await request(app).post('/api/v1/${kebabName}').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
` : ''}});
`;
}
