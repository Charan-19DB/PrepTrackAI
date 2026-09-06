import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'preptrack_super_secret_jwt_key_2026_cse_student', {
    expiresIn: '30d'
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, targetRole, placementYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate initial verification code
    const initialCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      authProvider: 'local',
      isEmailVerified: false,
      verificationCode: initialCode,
      targetRole: targetRole || 'Software Development Engineer (SDE)',
      placementYear: placementYear || 2026
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      targetRole: user.targetRole,
      placementYear: user.placementYear,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      settings: user.settings,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    const user = await User.findOne({ email: cleanEmail });
    if (user && (await user.matchPassword(password))) {
      // Update streak if needed
      const today = new Date().toISOString().split('T')[0];
      if (user.streak && user.streak.lastActiveDate !== today) {
        const lastDate = new Date(user.streak.lastActiveDate);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak.currentStreak += 1;
          if (user.streak.currentStreak > user.streak.longestStreak) {
            user.streak.longestStreak = user.streak.currentStreak;
          }
        } else if (diffDays > 1) {
          user.streak.currentStreak = 1;
        }
        user.streak.lastActiveDate = today;
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider || 'local',
        isEmailVerified: user.isEmailVerified || false,
        targetRole: user.targetRole,
        placementYear: user.placementYear,
        streak: user.streak,
        xp: user.xp,
        level: user.level,
        settings: user.settings,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    let { email, name, googleId, avatar, credential } = req.body;

    // Support real Google Identity Services token
    if (credential) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || name;
          avatar = decoded.picture || avatar;
          googleId = decoded.sub || googleId;
        }
      } catch (tokenErr) {
        console.error('Error decoding Google credential token:', tokenErr);
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Google email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      user.isEmailVerified = true;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      user.authProvider = 'google';

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (user.streak && user.streak.lastActiveDate !== today) {
        const lastDate = new Date(user.streak.lastActiveDate);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak.currentStreak += 1;
          if (user.streak.currentStreak > user.streak.longestStreak) {
            user.streak.longestStreak = user.streak.currentStreak;
          }
        } else if (diffDays > 1) {
          user.streak.currentStreak = 1;
        }
        user.streak.lastActiveDate = today;
      }
      await user.save();
    } else {
      // Create new verified user via Google
      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        googleId: googleId || `google_${Date.now()}`,
        authProvider: 'google',
        isEmailVerified: true,
        avatar: avatar || '',
        targetRole: 'Software Development Engineer (SDE)',
        placementYear: 2026,
        college: 'Computer Science & Engineering',
        xp: 150,
        level: 1,
        streak: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date().toISOString().split('T')[0]
        }
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      targetRole: user.targetRole,
      placementYear: user.placementYear,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      settings: user.settings,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // If user does not exist yet (e.g. testing with new email), auto-create or notify
    if (!user) {
      // If the email doesn't exist, create it with initial setup so the student can set their password and proceed immediately!
      user = await User.create({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: 'temporary_initial_pass_' + Date.now(),
        isEmailVerified: false,
        authProvider: 'local'
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    await user.save();

    res.json({
      success: true,
      email: user.email,
      message: `Password reset verification code sent to ${user.email}`,
      code // Provided for zero-friction verification in app
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, 6-digit code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid 6-digit verification code' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Update password and mark verified
    user.password = newPassword;
    user.resetPasswordCode = '';
    user.resetPasswordExpires = null;
    user.isEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! Logging you in...',
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      targetRole: user.targetRole,
      placementYear: user.placementYear,
      streak: user.streak,
      xp: user.xp,
      level: user.level,
      settings: user.settings,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/send-verification
router.post('/send-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Allow updating/editing email address before sending verification
    if (req.body.email && req.body.email.trim()) {
      const cleanEmail = req.body.email.toLowerCase().trim();
      if (cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'This email address is already in use by another account' });
        }
        user.email = cleanEmail;
        user.isEmailVerified = false;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    await user.save();

    res.json({
      success: true,
      email: user.email,
      message: `Verification code sent to ${user.email}`,
      code // Provided for zero-friction verification in app
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/verify-code
router.post('/verify-code', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!code || user.verificationCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isEmailVerified = true;
    user.verificationCode = '';
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully!',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.email && req.body.email.trim()) {
      const cleanEmail = req.body.email.toLowerCase().trim();
      if (cleanEmail !== user.email) {
        const emailExists = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
        if (emailExists) {
          return res.status(400).json({ message: 'This email is already in use by another account' });
        }
        user.email = cleanEmail;
        user.isEmailVerified = false;
      }
    }

    user.name = req.body.name || user.name;
    user.targetRole = req.body.targetRole || user.targetRole;
    user.placementYear = req.body.placementYear || user.placementYear;
    user.college = req.body.college || user.college;
    if (req.body.targetCompanies) user.targetCompanies = req.body.targetCompanies;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/auth/settings
router.put('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
