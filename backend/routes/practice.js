import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import PracticeQuestion from '../models/PracticeQuestion.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import Mistake from '../models/Mistake.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/practice/questions
router.get('/questions', protect, async (req, res) => {
  try {
    const { type, subject, difficulty, limit = 10 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const questions = await PracticeQuestion.find(query).limit(Number(limit));
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/practice/attempt
router.post('/attempt', protect, async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeTakenSeconds, notes, addToMistakes } = req.body;

    const question = await PracticeQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const isCorrect = String(selectedAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

    const attempt = await PracticeAttempt.create({
      userId: req.user._id,
      questionId: question._id,
      subject: question.subject,
      topic: question.topic,
      type: question.type,
      selectedAnswer,
      isCorrect,
      timeTakenSeconds: Number(timeTakenSeconds) || 0,
      difficulty: question.difficulty,
      notes: notes || '',
      addedToMistakes: !isCorrect && Boolean(addToMistakes)
    });

    let mistakeCreated = null;
    if (!isCorrect && addToMistakes) {
      mistakeCreated = await Mistake.create({
        userId: req.user._id,
        questionId: question._id,
        question: question.question,
        myAnswer: selectedAnswer,
        correctAnswer: question.correctAnswer,
        whyWrong: notes || question.explanation || 'Conceptual misunderstanding',
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        revisionDate: new Date().toISOString().split('T')[0]
      });
    }

    if (isCorrect) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          xp: 15,
          'studyStats.aptitudeSolvedCount': question.type === 'Aptitude' ? 1 : 0
        }
      });
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      attempt,
      mistakeCreated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/practice/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const attempts = await PracticeAttempt.find({ userId: req.user._id });
    const total = attempts.length;
    const correct = attempts.filter(a => a.isCorrect).length;
    const wrong = total - correct;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Breakdown by type
    const byType = {};
    attempts.forEach(a => {
      if (!byType[a.type]) byType[a.type] = { total: 0, correct: 0 };
      byType[a.type].total += 1;
      if (a.isCorrect) byType[a.type].correct += 1;
    });

    const categoryStats = Object.keys(byType).map(type => ({
      type,
      total: byType[type].total,
      correct: byType[type].correct,
      accuracy: Math.round((byType[type].correct / byType[type].total) * 100)
    }));

    res.json({
      totalAttempts: total,
      correctCount: correct,
      wrongCount: wrong,
      overallAccuracy: accuracy,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
