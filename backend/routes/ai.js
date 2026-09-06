import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import {
  getAIStudyPlan,
  getAIExplanation,
  getAIInterviewEvaluation,
  getAIQuizQuestions
} from '../services/aiService.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';

const router = express.Router();

// POST /api/ai/study-plan
router.post('/study-plan', protect, async (req, res) => {
  try {
    const { hoursAvailable = 3, targetRole } = req.body;
    const user = await User.findById(req.user._id);
    const weakTopics = await detectWeakTopics(req.user._id);

    const plan = await getAIStudyPlan({
      hoursAvailable: Number(hoursAvailable),
      targetRole: targetRole || user.targetRole,
      weakTopics,
      apiKey: user.settings?.geminiApiKey
    });

    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/explain
router.post('/explain', protect, async (req, res) => {
  try {
    const { topic, subject, queryType } = req.body;
    const user = await User.findById(req.user._id);

    const explanation = await getAIExplanation({
      topic: topic || 'Normalization',
      subject: subject || 'DBMS',
      queryType: queryType || 'explain',
      apiKey: user.settings?.geminiApiKey
    });

    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/interview-evaluate
router.post('/interview-evaluate', protect, async (req, res) => {
  try {
    const { question, idealAnswer, userAnswer } = req.body;
    const user = await User.findById(req.user._id);

    const evaluation = await getAIInterviewEvaluation({
      question,
      idealAnswer,
      userAnswer,
      apiKey: user.settings?.geminiApiKey
    });

    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/quiz-generate
router.post('/quiz-generate', protect, async (req, res) => {
  try {
    const { topic, subject, difficulty, count = 3 } = req.body;
    const user = await User.findById(req.user._id);

    const questions = await getAIQuizQuestions({
      topic: topic || 'Binary Search',
      subject: subject || 'Data Structures',
      difficulty: difficulty || 'Medium',
      count: Number(count),
      apiKey: user.settings?.geminiApiKey
    });

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/ai/revision-sheet
router.post('/revision-sheet', protect, async (req, res) => {
  try {
    const { topic, notes } = req.body;
    const summary = `### Quick Revision Sheet: ${topic}
- **Definition Summary**: High-frequency placement topic covering core algorithmic invariants.
- **Key Formulas / Syntax**: Remember boundary edge cases, null guards, and memory layout.
- **Primary Mistakes to Avoid**: Always verify whether indices are 0-indexed or 1-indexed, and check off-by-one loop conditions.
- **Interview Quick Tip**: Start answers by stating the best/worst case bounds before detailing implementation steps.
${notes ? `\n**Your Personal Notes Reflected**:\n> ${notes.slice(0, 200)}...` : ''}`;

    res.json({ revisionSheet: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
