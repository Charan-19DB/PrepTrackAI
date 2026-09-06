import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: function() { return !this.googleId; }
  },
  googleId: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  isEmailVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: '' },
  resetPasswordCode: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  targetRole: { type: String, default: 'Software Development Engineer (SDE)' },
  targetCompanies: [{ type: String }],
  placementYear: { type: Number, default: 2026 },
  college: { type: String, default: 'Computer Science & Engineering' },
  avatar: { type: String, default: '' },
  xp: { type: Number, default: 120 },
  level: { type: Number, default: 1 },
  streak: {
    currentStreak: { type: Number, default: 1 },
    longestStreak: { type: Number, default: 1 },
    lastActiveDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  studyStats: {
    totalMinutes: { type: Number, default: 0 },
    topicsCompletedCount: { type: Number, default: 0 },
    dsaSolvedCount: { type: Number, default: 0 },
    aptitudeSolvedCount: { type: Number, default: 0 },
    interviewQuestionsPracticed: { type: Number, default: 0 }
  },
  badges: [{
    badgeId: String,
    name: String,
    icon: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  settings: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    geminiApiKey: { type: String, default: '' },
    dailyStudyGoalMinutes: { type: Number, default: 180 },
    soundEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
