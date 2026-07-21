import express from 'express';
import { protect } from '../middleware/auth.js';
import { isGeminiConfigured } from '../services/gemini.js';
import { generateWorkflowFromPrompt, refineWorkflowFromPrompt } from '../services/aiArchitect.js';

const router = express.Router();
const getMw = (m) => (m && m.default) ? m.default : m;

// Availability check (public — the UI uses it to show setup instructions)
router.get('/status', (req, res) => {
  res.json({
    configured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
});

router.use(getMw(protect));

// Generate a brand-new workflow graph from a natural-language prompt
router.post('/generate-workflow', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
    return res.status(400).json({ error: 'Describe your backend in at least a sentence (10+ characters).' });
  }
  try {
    const result = await generateWorkflowFromPrompt(prompt.trim());
    res.json(result);
  } catch (err) {
    res.status(err.status && err.status >= 400 ? err.status : 500).json({ error: err.message });
  }
});

// Refine / extend an existing workflow graph
router.post('/refine-workflow', async (req, res) => {
  const { prompt, nodes, edges } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Describe the change you want to make.' });
  }
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: 'There is nothing on the canvas to refine — generate or build a workflow first.' });
  }
  try {
    const result = await refineWorkflowFromPrompt(prompt.trim(), nodes, edges || []);
    res.json(result);
  } catch (err) {
    res.status(err.status && err.status >= 400 ? err.status : 500).json({ error: err.message });
  }
});

export default router;
