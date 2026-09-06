import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import StudySession from '../models/StudySession.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/study-sessions
router.post('/', protect, async (req, res) => {
  try {
    const { subject, topic, durationMinutes, sessionType, notes, productivityRating } = req.body;
    const duration = Number(durationMinutes) || 25;

    const session = await StudySession.create({
      userId: req.user._id,
      subject: subject || 'General CSE',
      topic: topic || '',
      durationMinutes: duration,
      sessionType: sessionType || 'Pomodoro',
      notes: notes || '',
      productivityRating: productivityRating || 5,
      date: new Date().toISOString().split('T')[0]
    });

    // Update user stats and award XP (1 XP per minute studied)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'studyStats.totalMinutes': duration,
        xp: duration
      }
    });

    res.status(201).json({
      message: 'Study session logged successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/study-sessions
router.get('/', protect, async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const sessions = await StudySession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
