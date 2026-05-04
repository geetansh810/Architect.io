import express from 'express';
import User from '../models/User.js';
import Workflow from '../models/Workflow.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();

const getMw = (m) => (m && m.default) ? m.default : m;
// All admin routes require admin privileges
router.use(getMw(adminOnly));

// GET /api/admin/stats — Overall platform statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkflows = await Workflow.countDocuments();
    
    // Active users: logged in within last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: sevenDaysAgo } });

    // New users: registered within last 7 days
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const avgWorkflowsPerUser = totalUsers > 0 ? (totalWorkflows / totalUsers).toFixed(1) : 0;

    res.json({
      totalUsers,
      totalWorkflows,
      activeUsers,
      newUsers,
      avgWorkflowsPerUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — Detailed list of all users
router.get('/users', async (req, res) => {
  try {
    // Get all users and their workflow counts
    const users = await User.find().sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const workflowCount = await Workflow.countDocuments({ user_id: user._id });
      return {
        ...user.toJSON(),
        workflowCount
      };
    }));

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics — Data for charts
router.get('/analytics', async (req, res) => {
  try {
    // 1. Signups over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const signupsOverTime = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 2. Users by Country
    const usersByCountry = await User.aggregate([
      { $group: { _id: "$location.country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2b. Users by State/Region
    const usersByState = await User.aggregate([
      { $group: { _id: "$location.region", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2c. Users by City
    const usersByCity = await User.aggregate([
      { $group: { _id: "$location.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Workflow distribution (histogram of how many workflows users have)
    // Simplified: Top 10 users by workflow count
    const topWorkflows = await Workflow.aggregate([
        { $group: { _id: "$user_id", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                name: '$user.name',
                count: 1
            }
        }
    ]);

    res.json({
      signupsOverTime,
      usersByCountry,
      usersByState,
      usersByCity,
      topWorkflows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
