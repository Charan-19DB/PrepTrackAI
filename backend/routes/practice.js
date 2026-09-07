import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import PracticeQuestion from '../models/PracticeQuestion.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import Mistake from '../models/Mistake.js';
import User from '../models/User.js';
import Topic from '../models/Topic.js';
import { generateAIPracticeQuestions } from '../services/aiService.js';

const router = express.Router();

// GET /api/practice/concepts
// Returns concepts / topics for a given subject to power the concept multiple-choice selector
router.get('/concepts', protect, async (req, res) => {
  try {
    const { subject } = req.query;
    const query = {};
    if (subject && subject !== 'All') {
      query.subjectName = subject;
    }

    const topics = await Topic.find(query)
      .select('_id name subjectName importance difficulty description subtopics')
      .sort({ order: 1 });

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/practice/questions
router.get('/questions', protect, async (req, res) => {
  try {
    const { type, subject, topic, difficulty, limit = 25, fresh } = req.query;
    const targetLimit = Math.min(30, Math.max(10, Number(limit) || 25));

    // If fresh=true or if no questions exist for this query, generate dynamically with Gemini
    if (fresh === 'true') {
      const user = await User.findById(req.user._id);
      const generated = await generateAIPracticeQuestions({
        type: type && type !== 'All' ? type : 'All',
        subject: subject || '',
        topic: topic || '',
        difficulty: difficulty || 'Medium',
        count: targetLimit,
        apiKey: user?.settings?.geminiApiKey
      });

      // Insert generated questions so they have valid MongoDB IDs
      const docsToInsert = generated.map(q => ({
        ...q,
        isCustom: true,
        createdBy: req.user._id
      }));

      const createdQuestions = await PracticeQuestion.insertMany(docsToInsert);
      return res.json(createdQuestions);
    }

    const query = {};
    if (type && type !== 'All') query.type = type;
    if (subject && subject !== 'All') query.subject = subject;
    if (topic && topic !== 'All') query.topic = topic;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

    let questions = await PracticeQuestion.find(query).sort({ createdAt: -1 }).limit(targetLimit);

    // If questions in collection are empty or very low, generate fresh ones
    if (questions.length === 0) {
      const user = await User.findById(req.user._id);
      const generated = await generateAIPracticeQuestions({
        type: type && type !== 'All' ? type : 'All',
        subject: subject || '',
        topic: topic || '',
        difficulty: difficulty || 'Medium',
        count: targetLimit,
        apiKey: user?.settings?.geminiApiKey
      });

      const docsToInsert = generated.map(q => ({
        ...q,
        isCustom: true,
        createdBy: req.user._id
      }));

      questions = await PracticeQuestion.insertMany(docsToInsert);
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/practice/generate-fresh
// Generates 20 to 30 fresh questions focused on selected subject(s)
router.post('/generate-fresh', protect, async (req, res) => {
  try {
    const { type = 'All', subject = '', subjects = [], topic = '', difficulty = 'Medium', count = 25 } = req.body;
    const targetCount = Math.min(30, Math.max(10, Number(count) || 25));
    const user = await User.findById(req.user._id);

    // Normalize subjects array
    let subjectList = [];
    if (Array.isArray(subjects) && subjects.length > 0) {
      subjectList = subjects.filter(Boolean);
    } else if (Array.isArray(subject) && subject.length > 0) {
      subjectList = subject.filter(Boolean);
    } else if (typeof subject === 'string' && subject.trim()) {
      subjectList = subject.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (subjectList.length === 0) {
      subjectList = ['Operating Systems'];
    }

    const generated = await generateAIPracticeQuestions({
      type: type !== 'All' ? type : 'All',
      subject: subjectList.join(', '),
      subjects: subjectList,
      topic: topic || '',
      difficulty: difficulty || 'Medium',
      count: targetCount,
      apiKey: user?.settings?.geminiApiKey
    });

    const docsToInsert = generated.map(q => ({
      ...q,
      isCustom: true,
      createdBy: req.user._id
    }));

    const createdQuestions = await PracticeQuestion.insertMany(docsToInsert);
    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions
    });
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
