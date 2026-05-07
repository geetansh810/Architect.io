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
  generateService,
  generateMiddleware,
  generateStorageMiddleware,
  generateCronJob,
  generateWebhook
} from '../templates/generators.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const { entities, apis, auth, database, middlewares, storage, cronJobs, webhooks, relationships } = payload;
    
    if (!entities || entities.length === 0) {
      return res.status(400).json({ error: 'At least one entity is required.' });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    const zipBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      archive.on('data', chunk => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      let hasAuth = !!auth;
      const createdServices = new Set();

      // Generate files per entity
      entities.forEach(entity => {
        const entityRelationships = (relationships || []).filter(r => r.sourceEntity === entity.name);
        archive.append(generateModel(entity, entityRelationships), { name: `models/${entity.name}.js` });
        
        const api = (apis || []).find(a => a.entityName === entity.name);
        archive.append(generateController(entity, api || {}, entityRelationships), { name: `controllers/${entity.name}Controller.js` });
        
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

      // Generate Middlewares
      (middlewares || []).forEach((m, i) => {
        archive.append(generateMiddleware(m), { name: `middlewares/middleware${i}.js` });
      });

      // Generate Storage
      (storage || []).forEach((s, i) => {
        archive.append(generateStorageMiddleware(s), { name: `middlewares/upload${i}.js` });
      });

      // Generate Cron Jobs
      (cronJobs || []).forEach((c, i) => {
        archive.append(generateCronJob(c), { name: `jobs/job${i}.js` });
      });

      // Generate Webhooks
      (webhooks || []).forEach((w, i) => {
        archive.append(generateWebhook(w), { name: `webhooks/webhook${i}.js` });
      });

      if (hasAuth) {
        archive.append(generateAuthMiddleware(), { name: 'middlewares/auth.js' });
      }

      archive.append(generateAppJs(payload), { name: 'app.js' });
      archive.append(generatePackageJson(payload), { name: 'package.json' });
      archive.append(generateEnv(database, auth), { name: '.env.example' });
      archive.append(generateEnv(database, auth), { name: '.env' });

      archive.finalize();
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=generated-backend.zip');
    res.setHeader('Content-Length', zipBuffer.length);
    res.send(zipBuffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// A route just for previewing code
router.post('/preview', (req, res) => {
  try {
    const payload = req.body;
    const { entities, apis, auth, database, relationships } = payload;
    const preview = {};

    entities.forEach(entity => {
      const entityRelationships = (relationships || []).filter(r => r.sourceEntity === entity.name);
      preview[`models/${entity.name}.js`] = generateModel(entity, entityRelationships);
      
      const api = (apis || []).find(a => a.entityName === entity.name);
      preview[`controllers/${entity.name}Controller.js`] = generateController(entity, api || {}, entityRelationships);
      
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
    
    let hasAuth = !!auth || (apis || []).some(a => a.authEnabled);
    if (hasAuth) {
      preview['middlewares/auth.js'] = generateAuthMiddleware();
    }
    
    preview['app.js'] = generateAppJs(payload);
    preview['package.json'] = generatePackageJson(payload);

    res.json(preview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
