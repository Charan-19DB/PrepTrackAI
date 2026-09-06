import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Mistake from '../models/Mistake.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/mistakes
router.get('/', protect, async (req, res) => {
  try {
    const { resolved, subject, search } = req.query;
    const query = { userId: req.user._id };

    if (resolved !== undefined && resolved !== 'All') {
      query.resolved = resolved === 'true';
    }
    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const mistakes = await Mistake.find(query).sort({ revisionDate: 1, createdAt: -1 });
    res.json(mistakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/mistakes/today ("5 mistakes to revise today")
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const mistakes = await Mistake.find({
      userId: req.user._id,
      resolved: false,
      revisionDate: { $lte: today }
    }).limit(5);

    res.json(mistakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/mistakes
router.post('/', protect, async (req, res) => {
  try {
    const { question, myAnswer, correctAnswer, whyWrong, subject, topic, difficulty, revisionDate } = req.body;

    const mistake = await Mistake.create({
      userId: req.user._id,
      question,
      myAnswer,
      correctAnswer,
      whyWrong: whyWrong || '',
      subject: subject || 'General',
      topic: topic || 'General',
      difficulty: difficulty || 'Medium',
      revisionDate: revisionDate || new Date().toISOString().split('T')[0],
      resolved: false
    });

    res.status(201).json(mistake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/mistakes/:id/resolve
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const mistake = await Mistake.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mistake) return res.status(404).json({ message: 'Mistake entry not found' });

    mistake.resolved = !mistake.resolved;
    await mistake.save();

    if (mistake.resolved) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 15 } });
    }

    res.json(mistake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/mistakes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const mistake = await Mistake.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mistake) return res.status(404).json({ message: 'Mistake not found' });
    res.json({ message: 'Mistake entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
