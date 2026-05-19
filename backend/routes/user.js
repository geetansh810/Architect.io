import express from 'express';
import { User } from '../models/User.js';
import { Workflow } from '../models/Workflow.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getMw = (m) => (m && m.default) ? m.default : m;
router.use(getMw(protect));

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate user architecture stats dynamically
    const workflows = await Workflow.find({ user_id: req.user._id });
    const projectCount = workflows.length;
    const architectureCount = workflows.filter(w => w.architecture_json?.nodes?.length > 0).length;
    const totalNodes = workflows.reduce((sum, w) => sum + (w.architecture_json?.nodes?.length || 0), 0);

    const userJSON = user.toJSON();
    const profile = {
      ...userJSON,
      fullName: user.name, // compatibility fallback
      plan: user.role === 'Admin' ? 'pro' : 'free', // Map admin to pro plan for preview
    };

    res.json({
      user: profile,
      stats: {
        projectCount,
        architectureCount,
        totalNodes
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { fullName, location } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (fullName) {
      user.name = fullName;
    }

    if (location) {
      user.location = {
        ...user.location,
        country: location
      };
    }

    await user.save();

    const userJSON = user.toJSON();
    const profile = {
      ...userJSON,
      fullName: user.name,
      plan: user.role === 'Admin' ? 'pro' : 'free',
    };

    res.json({ user: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
