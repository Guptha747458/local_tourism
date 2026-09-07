// --- Imports ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const dns = require('dns');
const nodemailer = require('nodemailer');

// Use public DNS servers so Node.js SRV lookups work regardless of the local ISP resolver
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// --- Guard: refuse to start if JWT_SECRET is not set ---
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in your .env file.');
  console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// --- App Setup ---
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// --- Rate Limiters ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slightly more lenient for forgot/reset (user may retry with different email)
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: 'Too many password reset attempts, please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Database Connection ---
let dbReady = false;

mongoose.connect(process.env.DATABASE_URL, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
})
  .then(() => {
    dbReady = true;
    console.log('✅ Connected to MongoDB!');
  })
  .catch(err => {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error('   → Check that your IP is whitelisted in Atlas Network Access:');
    console.error('   → https://cloud.mongodb.com → Network Access → Add IP Address');
  });

// --- Mongoose Schema ---
const UserSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  password:         { type: String, required: true },
  favorites:        { type: [String], default: [] },
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date,   default: null },
});

const User = mongoose.model('User', UserSchema);

// --- Validation Helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LEN)
    return `Password must be at least ${MIN_PASSWORD_LEN} characters.`;
  return null;
}

function validateEmail(email) {
  if (!email || !EMAIL_RE.test(email))
    return 'Please enter a valid email address.';
  return null;
}

// --- Email Helper (Nodemailer) ---
// Configure SMTP via env vars. Falls back to console log in development.
async function sendPasswordResetEmail(email, resetUrl) {
  if (!process.env.SMTP_HOST) {
    // Development stub — token printed to server console
    console.log(`\n[PASSWORD RESET LINK] To: ${email}\n  ${resetUrl}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"Azure Coast Guide" <noreply@azurecoast.local>`,
    to:      email,
    subject: 'Reset your Azure Coast Guide password',
    text: `You requested a password reset.\n\nClick the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
}

// --- JWT Helpers ---
const JWT_SECRET  = process.env.JWT_SECRET;
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// --- DB Health Middleware ---
function requireDb(req, res, next) {
  if (!dbReady) {
    return res.status(503).json({
      message: 'Database is not connected. Please try again in a moment.',
    });
  }
  next();
}

// --- Auth Middleware ---
function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again.' });
  }
}

// --- API Endpoints ---

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'Azure Coast Guide API is running.' });
});

// ── Sign Up ───────────────────────────────────────────────────────────────────
app.post('/api/signup', authLimiter, requireDb, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ message: 'Full name is required.' });

    const emailErr = validateEmail(email);
    if (emailErr) return res.status(400).json({ message: emailErr });

    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: 'An account with that email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ name: name.trim(), email: email.toLowerCase(), password: hashedPassword });

    const token = signToken(newUser._id);
    res.cookie('token', token, COOKIE_OPTS);

    res.status(201).json({
      message: 'Account created successfully!',
      user: { name: newUser.name, email: newUser.email, favorites: newUser.favorites },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
app.post('/api/login', authLimiter, requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTS);

    res.status(200).json({
      message: 'Login successful!',
      user: { name: user.name, email: user.email, favorites: user.favorites },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.status(200).json({ message: 'Logged out successfully.' });
});

// ── Me (restore session on page load) ────────────────────────────────────────
app.get('/api/me', requireAuth, requireDb, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -resetToken -resetTokenExpiry');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: { name: user.name, email: user.email, favorites: user.favorites } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────
app.post('/api/forgot-password', passwordLimiter, requireDb, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way — prevents email enumeration
    if (!user) {
      return res.status(200).json({
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (mailErr) {
      console.error('Email send failed:', mailErr.message);
      // Don't expose email errors to the client
    }

    res.status(200).json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
app.post('/api/reset-password', passwordLimiter, requireDb, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required.' });

    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset token.' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Favorites ─────────────────────────────────────────────────────────────────
app.get('/api/favorites', requireAuth, requireDb, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('favorites');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/favorites', requireAuth, requireDb, async (req, res) => {
  try {
    const { favorites } = req.body;
    if (!Array.isArray(favorites))
      return res.status(400).json({ message: 'favorites must be an array.' });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { favorites },
      { new: true, select: 'favorites' }
    );
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});