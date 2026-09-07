import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';
import { generateFlashcardsFromTopic } from '../services/aiService.js';

const router = express.Router();

// GET /api/flashcards/due
router.get('/due', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cards = await Flashcard.find({
      userId: req.user._id,
      nextReviewDate: { $lte: today }
    }).sort({ nextReviewDate: 1 });

    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/flashcards
router.get('/', protect, async (req, res) => {
  try {
    const { subject, topic } = req.query;
    const query = { userId: req.user._id };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;

    const cards = await Flashcard.find(query).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/flashcards/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const { topic = 'Normalization', subject = 'DBMS and SQL', count = 5 } = req.body;
    const user = await User.findById(req.user._id);

    const generated = await generateFlashcardsFromTopic({
      topic,
      subject,
      count: Number(count) || 5,
      apiKey: user?.settings?.geminiApiKey
    });

    const today = new Date().toISOString().split('T')[0];
    const cardsToInsert = generated.map(c => ({
      userId: req.user._id,
      subject,
      topic,
      front: c.front,
      back: c.back,
      difficulty: c.difficulty || 'Medium',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: today,
      tags: c.tags || [subject, topic]
    }));

    const createdCards = await Flashcard.insertMany(cardsToInsert);
    res.status(201).json(createdCards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/flashcards/:id/review
// SuperMemo SM-2 Spaced Repetition rating: 'Again' (1), 'Hard' (2), 'Good' (3), 'Easy' (4)
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating } = req.body; // 'Again' | 'Hard' | 'Good' | 'Easy'
    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    let newInterval = 1;
    let newEase = card.easeFactor || 2.5;

    if (rating === 'Again') {
      newInterval = 1;
      card.repetitions = 0;
      newEase = Math.max(1.3, newEase - 0.2);
    } else if (rating === 'Hard') {
      newInterval = Math.max(1, Math.round(card.intervalDays * 1.2));
      newEase = Math.max(1.3, newEase - 0.15);
      card.repetitions += 1;
    } else if (rating === 'Good') {
      newInterval = card.repetitions === 0 ? 1 : (card.repetitions === 1 ? 3 : Math.round(card.intervalDays * newEase));
      card.repetitions += 1;
    } else if (rating === 'Easy') {
      newInterval = card.repetitions === 0 ? 3 : Math.round(card.intervalDays * newEase * 1.3);
      newEase += 0.15;
      card.repetitions += 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);
    const today = new Date().toISOString().split('T')[0];

    card.intervalDays = newInterval;
    card.easeFactor = newEase;
    card.nextReviewDate = nextDate.toISOString().split('T')[0];
    card.lastReviewedDate = today;

    await card.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });

    res.json({ success: true, card, nextReviewInDays: newInterval });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
