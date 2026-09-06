import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Topic from '../models/Topic.js';
import UserTopicProgress from '../models/UserTopicProgress.js';
import { calculateTopicProgress, determineStatusFromProgress } from '../services/progressCalculator.js';
import { scheduleTopicRevision } from '../services/spacedRepetition.js';

const router = express.Router();

// GET /api/topics
router.get('/', protect, async (req, res) => {
  try {
    const { subjectId, search, importance, difficulty } = req.query;
    const query = {};

    if (subjectId) query.subjectId = subjectId;
    if (importance) query.importance = importance;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subtopics: { $regex: search, $options: 'i' } }
      ];
    }

    const topics = await Topic.find(query).sort({ order: 1 });
    const userProgress = await UserTopicProgress.find({ userId: req.user._id });
    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.topicId.toString()] = p;
    });

    const enrichedTopics = topics.map(t => {
      const p = progressMap[t._id.toString()];
      return {
        ...t.toObject(),
        status: p?.status || 'Not Started',
        progressPercentage: p?.progressPercentage || 0,
        isImportant: p?.isImportant || false,
        lastStudiedAt: p?.lastStudiedAt || null,
        nextRevisionDate: p?.nextRevisionDate || null
      };
    });

    res.json(enrichedTopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/topics/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id).populate('subjectId', 'name slug category');
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    let progress = await UserTopicProgress.findOne({
      userId: req.user._id,
      topicId: topic._id
    });

    if (!progress) {
      progress = {
        status: 'Not Started',
        theoryCompleted: [],
        assessmentCompleted: [],
        practicalCompleted: [],
        interviewCompleted: [],
        progressPercentage: 0,
        notes: '',
        isImportant: false
      };
    }

    res.json({
      topic,
      userProgress: progress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/topics/:id/checklist
router.put('/:id/checklist', protect, async (req, res) => {
  try {
    const { section, itemId, completed } = req.body;
    // section: 'theory' | 'assessment' | 'practical' | 'interview'
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    let progress = await UserTopicProgress.findOne({
      userId: req.user._id,
      topicId: topic._id
    });

    if (!progress) {
      progress = new UserTopicProgress({
        userId: req.user._id,
        topicId: topic._id,
        subjectId: topic.subjectId,
        status: 'Learning',
        theoryCompleted: [],
        assessmentCompleted: [],
        practicalCompleted: [],
        interviewCompleted: [],
        progressPercentage: 0,
        lastStudiedAt: new Date()
      });
    }

    const fieldMap = {
      theory: 'theoryCompleted',
      assessment: 'assessmentCompleted',
      practical: 'practicalCompleted',
      interview: 'interviewCompleted'
    };

    const targetField = fieldMap[section];
    if (targetField) {
      const set = new Set(progress[targetField].map(String));
      if (completed) {
        set.add(String(itemId));
      } else {
        set.delete(String(itemId));
      }
      progress[targetField] = Array.from(set);
    }

    progress.lastStudiedAt = new Date();
    progress.progressPercentage = calculateTopicProgress(topic, progress);
    progress.status = determineStatusFromProgress(progress.progressPercentage, progress.status);

    // If completed or mastered, schedule revision stage 1
    if ((progress.status === 'Completed' || progress.status === 'Mastered') && progress.revisionStage === 0) {
      progress.revisionStage = 1;
      await scheduleTopicRevision(req.user._id, topic._id, topic.subjectName, topic.name, 1);
    }

    await progress.save();

    res.json({
      message: 'Checklist updated successfully',
      userProgress: progress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/topics/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, isImportant } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    let progress = await UserTopicProgress.findOne({
      userId: req.user._id,
      topicId: topic._id
    });

    if (!progress) {
      progress = new UserTopicProgress({
        userId: req.user._id,
        topicId: topic._id,
        subjectId: topic.subjectId,
        status: status || 'Learning'
      });
    }

    if (status) progress.status = status;
    if (typeof isImportant === 'boolean') progress.isImportant = isImportant;
    progress.lastStudiedAt = new Date();

    if ((status === 'Completed' || status === 'Mastered') && progress.revisionStage === 0) {
      progress.revisionStage = 1;
      await scheduleTopicRevision(req.user._id, topic._id, topic.subjectName, topic.name, 1);
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/topics/:id/notes
router.put('/:id/notes', protect, async (req, res) => {
  try {
    const { notes } = req.body;
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    let progress = await UserTopicProgress.findOne({
      userId: req.user._id,
      topicId: topic._id
    });

    if (!progress) {
      progress = new UserTopicProgress({
        userId: req.user._id,
        topicId: topic._id,
        subjectId: topic.subjectId,
        notes
      });
    } else {
      progress.notes = notes;
    }

    await progress.save();
    res.json({ message: 'Notes saved', notes: progress.notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/topics (add custom topic)
router.post('/', protect, async (req, res) => {
  try {
    const { subjectId, subjectName, name, description, difficulty, importance, subtopics } = req.body;
    const slug = `${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const topic = await Topic.create({
      subjectId,
      subjectName,
      name,
      slug,
      description,
      difficulty: difficulty || 'Medium',
      importance: importance || 'High',
      subtopics: subtopics || [`Fundamentals of ${name}`],
      isCustom: true
    });

    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
