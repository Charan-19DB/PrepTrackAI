import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import User from '../models/User.js';
import { getAIInterviewEvaluation } from '../services/aiService.js';

const router = express.Router();

// GET /api/interview/questions
router.get('/questions', protect, async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { idealAnswer: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await InterviewQuestion.find(query).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/interview/submit-answer
router.post('/submit-answer', protect, async (req, res) => {
  try {
    const { questionId, myAnswer, confidenceLevel, correctnessRating } = req.body;
    const question = await InterviewQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.userAnswers.push({
      userId: req.user._id,
      myAnswer,
      confidenceLevel: Number(confidenceLevel) || 3,
      correctnessRating: Number(correctnessRating) || 4,
      practicedAt: new Date()
    });

    await question.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'studyStats.interviewQuestionsPracticed': 1,
        xp: 20
      }
    });

    res.json({ message: 'Answer recorded successfully', question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/interview/evaluate (Practice Interview Mode)
router.post('/evaluate', protect, async (req, res) => {
  try {
    const { questionId, questionText, idealAnswer, userAnswer } = req.body;
    const user = await User.findById(req.user._id);

    let qText = questionText;
    let refAnswer = idealAnswer;

    if (questionId) {
      const q = await InterviewQuestion.findById(questionId);
      if (q) {
        qText = q.question;
        refAnswer = q.idealAnswer;
      }
    }

    const evaluation = await getAIInterviewEvaluation({
      question: qText,
      idealAnswer: refAnswer,
      userAnswer,
      apiKey: user?.settings?.geminiApiKey
    });

    // Award XP for interview practice
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'studyStats.interviewQuestionsPracticed': 1,
        xp: 35
      }
    });

    res.json({
      evaluation,
      question: qText,
      idealAnswer: refAnswer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/interview/random
router.get('/random', protect, async (req, res) => {
  try {
    const { category } = req.query;
    const match = {};
    if (category && category !== 'All') match.category = category;

    const count = await InterviewQuestion.countDocuments(match);
    if (count === 0) return res.status(404).json({ message: 'No questions found in this category' });

    const random = Math.floor(Math.random() * count);
    const question = await InterviewQuestion.findOne(match).skip(random);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
