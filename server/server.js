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

// --- App Setup ---
const app = express();

// Restrict CORS to the frontend origin and allow cookies
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// --- Rate Limiters ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 requests per window per IP
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Database Connection ---
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// --- Mongoose Schema ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Favorites: array of spot ID strings
  favorites: { type: [String], default: [] },
  // Password reset fields
  resetToken:       { type: String,  default: null },
  resetTokenExpiry: { type: Date,    default: null },
});

const User = mongoose.model('User', UserSchema);

// --- JWT Helpers ---
const JWT_SECRET  = process.env.JWT_SECRET  || 'CHANGE_ME';
const COOKIE_OPTS = {
  httpOnly: true,       // not accessible via JS — protects against XSS
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
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
  res.json({ message: 'Hello from the Azure Coast Guide server!' });
});

// ── Sign Up ──────────────────────────────────────────────────────────────────
app.post('/api/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'An account with that email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Issue JWT cookie immediately so the user is logged in after sign-up
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
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
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
app.get('/api/me', requireAuth, async (req, res) => {
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
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await User.findOne({ email });

    // Always respond with success to avoid leaking which emails are registered
    if (!user) {
      return res.status(200).json({
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // --- Stub: Replace this with a real email service (e.g. Nodemailer, SendGrid) ---
    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    console.log(`[PASSWORD RESET] Token for ${email}: ${resetUrl}`);
    // ---------------------------------------------------------------------------

    res.status(200).json({
      message: 'If that email is registered, a reset link has been sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Token and new password are required.' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }, // token must not be expired
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
// GET current favorites
app.get('/api/favorites', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('favorites');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST (replace) favorites array
app.post('/api/favorites', requireAuth, async (req, res) => {
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
  console.log(`Server is running on http://localhost:${PORT}`);
});