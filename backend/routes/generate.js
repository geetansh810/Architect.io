import express from 'express';
import archiver from 'archiver';
import { buildProjectFiles } from '../templates/generators.js';
import { validateArchitecture } from '../utils/connectionRules.js';

const router = express.Router();

/**
 * Server-side rectification gate. The frontend sends the raw canvas graph
 * alongside the parsed payload; generation is refused (422) while the graph
 * contains hard errors, so broken wiring can never reach code generation.
 */
function checkPayload(payload) {
  if (!payload.entities || payload.entities.length === 0) {
    return { errors: [{ code: 'graph/no-entity', message: 'At least one entity is required.' }], warnings: [], valid: false };
  }
  if (payload.graph?.nodes) {
    return validateArchitecture(payload.graph.nodes, payload.graph.edges || []);
  }
  return { errors: [], warnings: [], valid: true };
}

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const validation = checkPayload(payload);
    if (!validation.valid) {
      return res.status(422).json({
        error: 'Architecture validation failed — fix the reported issues before generating.',
        validation,
      });
    }

    const files = buildProjectFiles(payload);

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
      Object.entries(files).forEach(([path, content]) => {
        archive.append(content, { name: path });
      });
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

// Validate without generating — used by the pre-flight check in the builder
router.post('/validate', (req, res) => {
  try {
    const { nodes = [], edges = [] } = req.body || {};
    res.json(validateArchitecture(nodes, edges));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview the generated file map as JSON
router.post('/preview', (req, res) => {
  try {
    const payload = req.body;
    const validation = checkPayload(payload);
    if (!validation.valid) {
      return res.status(422).json({ error: 'Architecture validation failed.', validation });
    }
    res.json(buildProjectFiles(payload));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
