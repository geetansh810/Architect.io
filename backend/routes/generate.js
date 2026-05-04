import express from 'express';
import archiver from 'archiver';
import { 
  generateModel, 
  generateController, 
  generateRoutes, 
  generateAuthMiddleware, 
  generateAppJs, 
  generatePackageJson, 
  generateEnv,
  generateService
} from '../templates/generators.js';

const router = express.Router();

router.post('/', (req, res) => {
  try {
    const { entities, apis, auth, database, mailer } = req.body;
    
    if (!entities || entities.length === 0) {
      return res.status(400).json({ error: 'At least one entity is required.' });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment('generated-backend.zip');
    
    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    let hasAuth = !!auth;
    const createdServices = new Set();

    // Generate files per entity/api
    entities.forEach(entity => {
      archive.append(generateModel(entity), { name: `models/${entity.name}.js` });
      
      const api = apis.find(a => a.entityName === entity.name);
      archive.append(generateController(entity, api || {}), { name: `controllers/${entity.name}Controller.js` });
      
      if (api) {
        if (api.authEnabled) hasAuth = true;
        archive.append(generateRoutes(api, entity), { name: `routes/${entity.name}Routes.js` });
        
        if (api.logic && api.logic.length > 0) {
          api.logic.forEach(logicNode => {
            const serviceName = logicNode.name.replace(/\s+/g, '') + 'Service';
            if (!createdServices.has(serviceName)) {
              archive.append(generateService(logicNode), { name: `services/${serviceName}.js` });
              createdServices.add(serviceName);
            }
          });
        }
      }
    });

    if (hasAuth) {
      archive.append(generateAuthMiddleware(), { name: 'middlewares/auth.js' });
    }

    archive.append(generateAppJs(apis, hasAuth, database), { name: 'app.js' });
    archive.append(generatePackageJson(), { name: 'package.json' });
    archive.append(generateEnv(database, auth), { name: '.env.example' });
    archive.append(generateEnv(database, auth), { name: '.env' });

    archive.finalize();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// A route just for previewing code
router.post('/preview', (req, res) => {
  try {
    const { entities, apis, auth, database } = req.body;
    const preview = {};

    entities.forEach(entity => {
      preview[`models/${entity.name}.js`] = generateModel(entity);
      
      const api = apis.find(a => a.entityName === entity.name);
      preview[`controllers/${entity.name}Controller.js`] = generateController(entity, api || {});
      
      if (api) {
        preview[`routes/${entity.name}Routes.js`] = generateRoutes(api, entity);
        
        if (api.logic && api.logic.length > 0) {
          api.logic.forEach(logicNode => {
            const serviceName = logicNode.name.replace(/\s+/g, '') + 'Service';
            preview[`services/${serviceName}.js`] = generateService(logicNode);
          });
        }
      }
    });
    
    let hasAuth = !!auth || apis.some(a => a.authEnabled);
    if (hasAuth) {
      preview['middlewares/auth.js'] = generateAuthMiddleware();
    }
    
    preview['app.js'] = generateAppJs(apis, hasAuth, database);

    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
