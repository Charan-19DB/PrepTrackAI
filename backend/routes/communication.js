import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import CommunicationPractice from '../models/CommunicationPractice.js';
import User from '../models/User.js';
import { evaluateWritingText, evaluateSpeakingAudioTranscript } from '../services/aiService.js';

const router = express.Router();

// POST /api/communication/writing/analyze
router.post('/writing/analyze', protect, async (req, res) => {
  try {
    const { text, type = 'general', topic = 'Professional Writing' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text submission is required' });
    }

    const user = await User.findById(req.user._id);
    const evaluation = await evaluateWritingText({
      text,
      type,
      apiKey: user?.settings?.geminiApiKey
    });

    const record = await CommunicationPractice.create({
      userId: req.user._id,
      moduleType: 'Writing',
      topicOrPrompt: topic,
      submissionText: text,
      overallScore: evaluation.overallScore || 75,
      subScores: {
        grammar: evaluation.grammarScore || 75,
        clarity: evaluation.clarityScore || 80,
        vocabulary: evaluation.vocabularyScore || 70,
        professionalism: evaluation.professionalismScore || 80
      },
      corrections: evaluation.corrections || [],
      improvedVersion: evaluation.improvedVersion || '',
      feedbackTip: evaluation.actionableTip || ''
    });

    // Reward XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 25 } });

    res.json({
      evaluation,
      record
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/communication/speaking/analyze
router.post('/speaking/analyze', protect, async (req, res) => {
  try {
    const { transcript, topic = 'Tell me about yourself' } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ message: 'Speech transcript is required' });
    }

    const user = await User.findById(req.user._id);
    const evaluation = await evaluateSpeakingAudioTranscript({
      transcript,
      topic,
      apiKey: user?.settings?.geminiApiKey
    });

    const record = await CommunicationPractice.create({
      userId: req.user._id,
      moduleType: 'Speaking',
      topicOrPrompt: topic,
      submissionText: transcript,
      overallScore: evaluation.overallScore || 75,
      subScores: {
        grammar: evaluation.grammarScore || 75,
        clarity: evaluation.clarityScore || 80,
        vocabulary: evaluation.vocabularyScore || 75,
        fluency: evaluation.fluencyScore || 80,
        confidence: evaluation.confidenceScore || 75
      },
      fillerWords: evaluation.fillerWords || {},
      totalFillers: evaluation.totalFillers || 0,
      feedbackTip: evaluation.actionableTip || ''
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 30 } });

    res.json({
      evaluation,
      record
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/communication/listening/exercise
router.get('/listening/exercise', protect, async (req, res) => {
  try {
    const exercise = {
      id: 'listen_01',
      title: 'Microservices Architecture & Latency Budgets',
      speaker: 'Staff Infrastructure Architect',
      passage: `In distributed systems, microservices communicate over network boundaries rather than in-memory function calls. This introduces non-zero network serialization and round-trip latency. To maintain a sub-second response time for client requests, engineering teams enforce latency budgets. Each downstream service is allocated a deterministic time window, such as 30 milliseconds for the caching layer and 80 milliseconds for relational database queries. When a service exceeds its allocated budget, circuit breakers or fallback caches must trigger to protect the system from cascading failure.`,
      questions: [
        {
          id: 1,
          question: 'What is the primary factor that causes latency in microservices compared to monolithic systems?',
          options: [
            'Network serialization and round-trip communication over boundaries',
            'Operating system kernel panics',
            'Lack of database indexing',
            'High CPU overclocking'
          ],
          correctAnswer: 'Network serialization and round-trip communication over boundaries',
          explanation: 'Microservices communicate across physical networks, incurring serialization and transport overhead.'
        },
        {
          id: 2,
          question: 'What mechanism is used to prevent downstream timeouts from crashing the entire system?',
          options: [
            'Circuit breakers and fallback caches',
            'Restarting all server hardware',
            'Disabling HTTPS encryption',
            'Increasing database connection pools infinitely'
          ],
          correctAnswer: 'Circuit breakers and fallback caches',
          explanation: 'Circuit breakers immediately fail or return cached data when latency thresholds are violated.'
        },
        {
          id: 3,
          question: 'In the passage, what was the latency budget allocated for the caching layer?',
          options: ['30 milliseconds', '80 milliseconds', '100 milliseconds', '5 milliseconds'],
          correctAnswer: '30 milliseconds',
          explanation: 'The passage explicitly mentions 30 milliseconds for the caching layer and 80 milliseconds for relational queries.'
        }
      ]
    };

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/communication/reading/exercise
router.get('/reading/exercise', protect, async (req, res) => {
  try {
    const exercise = {
      id: 'read_01',
      title: 'Event-Driven Concurrency and the Actor Model',
      wordCount: 220,
      passage: `Traditional multi-threaded concurrent programming relies heavily on shared state protected by mutual exclusion primitives such as mutexes, semaphores, and read-write locks. However, shared-state concurrency suffers from insidious pitfalls including deadlocks, livelocks, priority inversion, and non-deterministic race conditions. The Actor Model provides a fundamentally different paradigm where autonomous concurrent entities, known as actors, encapsulate their own private state and never share memory. Communication occurs exclusively through asynchronous, non-blocking message passing. Each actor possesses a dedicated message queue, commonly called a mailbox. Upon receiving a message, an actor can synchronously process it, send a finite number of messages to other actors, create new actors, or modify its own internal state for subsequent messages. Because no two threads access shared memory concurrently, race conditions and deadlocks are formally eliminated by architectural design.`,
      questions: [
        {
          id: 1,
          question: 'Why does the Actor Model eliminate race conditions and deadlocks by design?',
          options: [
            'Actors never share mutable memory and communicate solely via message passing',
            'Actors run on separate physical servers exclusively',
            'All operations are executed synchronously on a single CPU core',
            'Locks are automatically acquired across all actors globally'
          ],
          correctAnswer: 'Actors never share mutable memory and communicate solely via message passing',
          explanation: 'Because actors do not share state, conflicting concurrent memory accesses cannot occur.'
        },
        {
          id: 2,
          question: 'What is the private message queue of an actor typically called?',
          options: ['Mailbox', 'Stack buffer', 'Ring oscillator', 'Channel stream'],
          correctAnswer: 'Mailbox',
          explanation: 'In the Actor Model, each actor receives messages into an isolated message queue called a mailbox.'
        }
      ]
    };

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/communication/history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await CommunicationPractice.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
