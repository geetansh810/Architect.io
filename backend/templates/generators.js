export const generateModel = (entity, relationships = []) => {
  const fields = entity.fields.map(f => {
    let mongooseType = 'String';
    if (f.type === 'number') mongooseType = 'Number';
    if (f.type === 'boolean') mongooseType = 'Boolean';
    if (f.type === 'date') mongooseType = 'Date';
    
    return `  ${f.name}: { type: ${mongooseType}, required: ${f.required ? 'true' : 'false'} }`;
  });

  // Add relationship fields
  relationships.forEach(rel => {
    if (rel.type === '1:N' || rel.type === '1:1') {
      fields.push(`  ${rel.foreignKey}: { type: mongoose.Schema.Types.ObjectId, ref: '${rel.refEntity}' }`);
    } else if (rel.type === 'N:M') {
      fields.push(`  ${rel.foreignKey}: [{ type: mongoose.Schema.Types.ObjectId, ref: '${rel.refEntity}' }]`);
    }
  });

  const fieldsString = fields.join(',\n');

  return `const mongoose = require('mongoose');

const ${entity.name}Schema = new mongoose.Schema({
${fieldsString}
}, { timestamps: true });

module.exports = mongoose.model('${entity.name}', ${entity.name}Schema);
`;
};

export const generateController = (entity, api = {}, relationships = []) => {
  const logic = api.logic || [];
  
  // Group logic by hook
  const hooks = {
    'before-create': [], 'after-create': [],
    'before-update': [], 'after-update': [],
    'before-delete': [], 'after-delete': []
  };
  
  logic.forEach(l => {
    if (hooks[l.hook]) hooks[l.hook].push(l);
  });

  const imports = logic.map(l => {
    const serviceName = l.name.replace(/\s+/g, '') + 'Service';
    return `const ${serviceName} = require('../services/${serviceName}');`;
  }).filter((v, i, a) => a.indexOf(v) === i).join('\n');

  const invokeHooks = (hookName, dataVar) => {
    return hooks[hookName].map(l => {
      const serviceName = l.name.replace(/\s+/g, '') + 'Service';
      return `    await ${serviceName}.execute(${dataVar});`;
    }).join('\n');
  };

  const populateString = relationships.map(rel => `.populate('${rel.foreignKey}')`).join('');

  return `const ${entity.name} = require('../models/${entity.name}');
${imports}

exports.getAll = async (req, res) => {
  try {
    const data = await ${entity.name}.find()${populateString};
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await ${entity.name}.findById(req.params.id)${populateString};
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
${invokeHooks('before-create', 'req.body')}
    const data = new ${entity.name}(req.body);
    await data.save();
${invokeHooks('after-create', 'data')}
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
${invokeHooks('before-update', 'req.body')}
    const data = await ${entity.name}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) return res.status(404).json({ error: 'Not found' });
${invokeHooks('after-update', 'data')}
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
${invokeHooks('before-delete', 'req.params.id')}
    const data = await ${entity.name}.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
${invokeHooks('after-delete', 'data')}
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
`;
};

export const generateRoutes = (api, entity) => {
  const authMiddlewareImport = api.authEnabled ? `const { protect } = require('../middlewares/auth');\n` : '';
  const authMw = api.authEnabled ? 'protect, ' : '';
  
  return `const express = require('express');
const router = express.Router();
const ${entity.name}Controller = require('../controllers/${entity.name}Controller');
${authMiddlewareImport}
router.get('/', ${authMw}${entity.name}Controller.getAll);
router.get('/:id', ${authMw}${entity.name}Controller.getById);
router.post('/', ${authMw}${entity.name}Controller.create);
router.put('/:id', ${authMw}${entity.name}Controller.update);
router.delete('/:id', ${authMw}${entity.name}Controller.delete);

module.exports = router;
`;
};

export const generateAuthMiddleware = () => {
  return `const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
`;
};

export const generateMiddleware = (middleware) => {
  if (middleware.middlewareType === 'Rate Limiter') {
    return `const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: ${middleware.config?.windowMs || 900000},
  max: ${middleware.config?.maxRequests || 100},
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = limiter;
`;
  }
  
  if (middleware.middlewareType === 'Logger') {
    return `const morgan = require('morgan');
module.exports = morgan('dev');
`;
  }

  return `module.exports = (req, res, next) => {
  console.log('Custom Middleware Executing...');
  next();
};`;
};

export const generateStorageMiddleware = (storage) => {
  return `const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: ${storage.maxSizeMB || 5} * 1024 * 1024 }
});

module.exports = upload;
`;
};

export const generateCronJob = (job) => {
  return `const cron = require('node-cron');

// Job: ${job.jobName}
cron.schedule('${job.schedule || '0 0 * * *'}', () => {
  console.log('Running recurring job: ${job.jobName}');
  // TODO: Implement your job logic here
});
`;
};

export const generateWebhook = (webhook) => {
  return `const express = require('express');
const router = express.Router();

// Webhook for ${webhook.provider} (${webhook.direction})
router.post('${webhook.path || '/webhooks'}', (req, res) => {
  const event = req.body;
  console.log('Received ${webhook.provider} webhook event:', event.type);
  
  // TODO: Verify signature and process event
  
  res.status(200).send({ received: true });
});

module.exports = router;
`;
};

export const generateAppJs = (payload) => {
  const { apis, database, middlewares, storage, cronJobs, webhooks } = payload;
  
  const routeImports = apis.map(api => `const ${api.entityName}Routes = require('./routes/${api.entityName}Routes');`).join('\n');
  const routeUses = apis.map(api => `app.use('${api.route}', ${api.entityName}Routes);`).join('\n');
  
  const middlewareImports = (middlewares || []).map((m, i) => `const middleware${i} = require('./middlewares/middleware${i}');`).join('\n');
  const middlewareUses = (middlewares || []).map((m, i) => `app.use(middleware${i});`).join('\n');

  const webhookImports = (webhooks || []).map((w, i) => `const webhook${i} = require('./webhooks/webhook${i}');`).join('\n');
  const webhookUses = (webhooks || []).map((w, i) => `app.use(webhook${i});`).join('\n');

  const cronImports = (cronJobs || []).map((c, i) => `require('./jobs/job${i}');`).join('\n');

  const dbType = database?.type || 'mongodb';
  const dbUriDefault = dbType === 'mongodb' 
    ? 'mongodb://localhost:27017/backendflow' 
    : 'postgres://localhost:5432/backendflow';

  return `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Middlewares
${middlewareImports}
${middlewareUses}

// Webhooks
${webhookImports}
${webhookUses}

// Connect to Database
mongoose.connect(process.env.DB_URI || '${dbUriDefault}')
  .then(() => console.log('${dbType === 'mongodb' ? 'MongoDB' : 'Database'} Connected'))
  .catch(err => console.error(err));

// Routes
${routeImports}
${routeUses}

// Cron Jobs
${cronImports}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;
};

export const generatePackageJson = (payload) => {
  const { middlewares, storage, cronJobs } = payload;
  
  const deps = {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2"
  };

  if (middlewares?.some(m => m.middlewareType === 'Rate Limiter')) {
    deps["express-rate-limit"] = "^7.1.5";
  }
  if (middlewares?.some(m => m.middlewareType === 'Logger')) {
    deps["morgan"] = "^1.10.0";
  }
  if (storage?.length > 0) {
    deps["multer"] = "^1.4.5-lts.1";
  }
  if (cronJobs?.length > 0) {
    deps["node-cron"] = "^3.0.3";
  }

  return JSON.stringify({
    name: "generated-backend",
    version: "1.0.0",
    description: "Generated with BackendFlow",
    main: "app.js",
    scripts: {
      "start": "node app.js",
      "dev": "nodemon app.js"
    },
    dependencies: deps,
    devDependencies: {
      "nodemon": "^3.0.1"
    }
  }, null, 2);
};

export const generateEnv = (database = null, auth = null) => {
  const dbUri = database?.uri || (database?.type === 'mongodb' ? 'mongodb://localhost:27017/generated-app' : 'postgres://localhost:5432/generated-app');
  const jwtSecret = auth?.secret || 'supersecretjwtkey';
  
  return `PORT=5000
DB_URI=${dbUri}
JWT_SECRET=${jwtSecret}
JWT_EXPIRY=${auth?.expiry || '24h'}
`;
};

export const generateService = (logicNode) => {
  return `// Auto-generated Service for: ${logicNode.name}

exports.execute = async (data) => {
  console.log('Executing ${logicNode.name} logic...');
  // TODO: Implement your custom business logic here
  
  return true;
};
`;
};
