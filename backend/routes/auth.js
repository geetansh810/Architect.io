import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email.js';
import crypto from 'crypto';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'architect_dev_secret';
const JWT_EXPIRES_IN = '7d';

const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Helper: get approximate location from IP via ip-api.com
const getGeoLocation = async (ip, timezone) => {
  try {
    // Skip for localhost/private IPs if no client-provided IP
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      // Fallback: Guess country from timezone if available
      const countryFromTz = timezone ? timezone.split('/')[0] : 'Local';
      return { country: countryFromTz, city: 'Localhost', ip };
    }
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,zip,lat,lon,status`);
    const data = await res.json();
    if (data.status === 'success') {
      return { 
        country: data.country || 'Unknown', 
        region: data.regionName || 'Unknown',
        city: data.city || 'Unknown', 
        zip: data.zip || 'Unknown',
        lat: data.lat || 0,
        lon: data.lon || 0,
        ip 
      };
    }
  } catch { /* silently fail — don't block signup */ }
  return { country: 'Unknown', city: 'Unknown', ip };
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, clientIp, timezone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Capture IP and geo location (Prioritize client-side detected IP)
    const serverDetectedIp = (req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
    const targetIp = clientIp || serverDetectedIp;
    const location = await getGeoLocation(targetIp, timezone);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({ 
      name, 
      email, 
      password, 
      location, 
      otp, 
      otpExpires,
      isVerified: false 
    });

    // Send OTP Email
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: 'OTP sent to your email. Please verify to continue.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    user.lastLogin = new Date();
    await user.save();

    // Send Welcome Email
    await sendWelcomeEmail(user.email, user.name);

    const token = signToken(user._id);
    res.json({ token, user, message: 'Account verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Account already verified.' });

    if (user.otpResendCount >= 3) {
      return res.status(403).json({ error: 'Maximum resend attempts (3) reached. Please contact support.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpResendCount += 1;
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ message: `OTP resent. Attempts remaining: ${3 - user.otpResendCount}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.', needsVerification: true });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

export default router;
