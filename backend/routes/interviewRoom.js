import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import InterviewSession from '../models/InterviewSession.js';
import User from '../models/User.js';
import { generateInteractiveInterviewTurn, concludeInterviewEvaluation, executeWithGemini } from '../services/aiService.js';

const router = express.Router();

// POST /api/interview-room/start
router.post('/start', protect, async (req, res) => {
  try {
    const { interviewType = 'Technical', difficulty = 'Medium', durationMinutes = 15, topics = ['DBMS', 'OS', 'DSA'] } = req.body;
    const user = await User.findById(req.user._id);

    // Generate first question
    let firstQuestion = `Welcome to your ${interviewType} interview! To get started, could you briefly introduce yourself and highlight a technical project you are most proud of?`;
    if (interviewType === 'Technical') {
      firstQuestion = `Welcome! Let's begin the technical round. Could you explain the fundamental difference between relational database indexing and hash indexing, and when you would prefer one over the other?`;
    } else if (interviewType === 'HR') {
      firstQuestion = `Welcome! Tell me about yourself, your educational background, and what motivated you to pursue a software engineering career?`;
    }

    const session = await InterviewSession.create({
      userId: req.user._id,
      interviewType,
      difficulty,
      durationMinutes: Number(durationMinutes),
      topics,
      messages: [
        {
          role: 'interviewer',
          text: firstQuestion,
          isFollowUp: false
        }
      ],
      status: 'In Progress'
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/interview-room/:id/respond
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { candidateResponse } = req.body;
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Interview session not found' });

    if (!candidateResponse || !candidateResponse.trim()) {
      return res.status(400).json({ message: 'Candidate response is required' });
    }

    // Append candidate message
    session.messages.push({
      role: 'candidate',
      text: candidateResponse.trim()
    });

    // Find the latest interviewer question
    const questionsAsked = session.messages.filter(m => m.role === 'interviewer');
    const currentQuestion = questionsAsked[questionsAsked.length - 1]?.text || '';

    const user = await User.findById(req.user._id);
    const turn = await generateInteractiveInterviewTurn({
      history: session.messages.slice(-6),
      currentQuestion,
      candidateResponse,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      apiKey: user?.settings?.geminiApiKey
    });

    const nextInterviewerText = turn.interviewerReaction 
      ? `${turn.interviewerReaction} ${turn.nextQuestion}`
      : turn.nextQuestion;

    session.messages.push({
      role: 'interviewer',
      text: nextInterviewerText,
      isFollowUp: Boolean(turn.isFollowUp)
    });

    await session.save();

    res.json({
      session,
      nextQuestion: nextInterviewerText,
      isFollowUp: Boolean(turn.isFollowUp)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/interview-room/:id/conclude
router.post('/:id/conclude', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Interview session not found' });

    const user = await User.findById(req.user._id);
    const evaluation = await concludeInterviewEvaluation({
      history: session.messages,
      interviewType: session.interviewType,
      apiKey: user?.settings?.geminiApiKey
    });

    session.status = 'Completed';
    session.evaluationReport = evaluation;
    await session.save();

    // Reward user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        xp: 50,
        'studyStats.interviewQuestionsPracticed': session.messages.filter(m => m.role === 'candidate').length
      }
    });

    res.json({
      session,
      evaluation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/interview-room/history
router.get('/history', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
