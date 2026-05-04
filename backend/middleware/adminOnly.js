import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'architect_dev_secret';

export const adminOnly = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (user.role !== 'Admin') return res.status(403).json({ error: 'Access denied. Admins only.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
