import express from 'express';
import Workflow from '../models/Workflow.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getMw = (m) => (m && m.default) ? m.default : m;
// All workflow routes require authentication
router.use(getMw(protect));

// GET all workflows for the logged-in user
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find({ user_id: req.user._id }).sort({ updated_at: -1 });
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single workflow
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new workflow
router.post('/', async (req, res) => {
  try {
    const { name, architecture_json } = req.body;
    const workflow = await Workflow.create({
      user_id: req.user._id,
      name,
      architecture_json: architecture_json || {},
    });
    res.status(201).json(workflow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update workflow (partial — only updates fields that are provided)
router.put('/:id', async (req, res) => {
  try {
    const { name, architecture_json } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (architecture_json !== undefined) update.architecture_json = architecture_json;

    const workflow = await Workflow.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE workflow
router.delete('/:id', async (req, res) => {
  try {
    await Workflow.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
