import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import DailyChallenge from '../models/DailyChallenge.js';
import User from '../models/User.js';
import { generateAIPracticeQuestions } from '../services/aiService.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';

const router = express.Router();

// GET /api/daily-challenge/today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let challenge = await DailyChallenge.findOne({ userId: req.user._id, date: today });

    if (!challenge) {
      // Find weak topics to adapt today's questions
      const weakTopics = await detectWeakTopics(req.user._id);
      const focusSubject = weakTopics[0]?.subject || 'Operating Systems';

      const user = await User.findById(req.user._id);
      const generated = await generateAIPracticeQuestions({
        type: 'All',
        subject: focusSubject,
        difficulty: 'Medium',
        count: 5,
        apiKey: user?.settings?.geminiApiKey
      });

      challenge = await DailyChallenge.create({
        userId: req.user._id,
        date: today,
        questions: generated.map(q => ({
          subject: q.subject,
          topic: q.topic,
          type: q.type,
          question: q.question,
          codeSnippet: q.codeSnippet || '',
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty
        })),
        totalQuestions: generated.length,
        completedQuestions: 0,
        score: 0,
        status: 'Pending'
      });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/daily-challenge/answer
router.post('/answer', protect, async (req, res) => {
  try {
    const { questionIndex, selectedAnswer } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const challenge = await DailyChallenge.findOne({ userId: req.user._id, date: today });

    if (!challenge) return res.status(404).json({ message: 'Daily challenge not found for today' });

    const q = challenge.questions[questionIndex];
    if (!q) return res.status(400).json({ message: 'Invalid question index' });

    const isCorrect = String(selectedAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    q.userAnswer = selectedAnswer;
    q.isCorrect = isCorrect;

    // Recalculate completed questions & score
    const answered = challenge.questions.filter(item => item.userAnswer).length;
    const correctCount = challenge.questions.filter(item => item.isCorrect).length;
    challenge.completedQuestions = answered;
    challenge.score = Math.round((correctCount / challenge.totalQuestions) * 100);

    if (answered === challenge.totalQuestions) {
      challenge.status = 'Completed';
      const xpEarned = correctCount * 20 + 50; // 50 bonus for completing challenge
      challenge.xpAwarded = xpEarned;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { xp: xpEarned }
      });
    } else {
      challenge.status = 'In Progress';
    }

    await challenge.save();
    res.json({
      isCorrect,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      challenge
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/daily-challenge/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await DailyChallenge.find({ userId: req.user._id }).sort({ date: -1 }).limit(14);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
