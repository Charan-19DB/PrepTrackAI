import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import DailyTask from '../models/DailyTask.js';
import User from '../models/User.js';
import { getAIStudyPlan } from '../services/aiService.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';

const router = express.Router();

// GET /api/tasks/today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await DailyTask.find({ userId: req.user._id, date: today }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks?date=YYYY-MM-DD
router.get('/', protect, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const tasks = await DailyTask.find({ userId: req.user._id, date }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { subject, topic, subtopic, timeSlot, estimatedDuration, difficulty, date, notes } = req.body;
    const taskDate = date || new Date().toISOString().split('T')[0];

    const task = await DailyTask.create({
      userId: req.user._id,
      date: taskDate,
      subject,
      topic,
      subtopic: subtopic || '',
      timeSlot: timeSlot || 'Morning',
      estimatedDuration: Number(estimatedDuration) || 45,
      difficulty: difficulty || 'Medium',
      notes: notes || '',
      status: 'Not Started',
      isCompleted: false
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await DailyTask.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.body.status) {
      task.status = req.body.status;
      task.isCompleted = req.body.status === 'Completed';
    }
    if (typeof req.body.isCompleted === 'boolean') {
      task.isCompleted = req.body.isCompleted;
      task.status = req.body.isCompleted ? 'Completed' : 'Not Started';
    }
    if (req.body.actualDuration !== undefined) task.actualDuration = Number(req.body.actualDuration);
    if (req.body.notes !== undefined) task.notes = req.body.notes;
    if (req.body.timeSlot) task.timeSlot = req.body.timeSlot;

    const updatedTask = await task.save();

    // Award XP if completed
    if (task.isCompleted) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 25 } });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await DailyTask.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/tasks/generate-ai
router.post('/generate-ai', protect, async (req, res) => {
  try {
    const { hoursAvailable = 3, targetRole } = req.body;
    const weakTopics = await detectWeakTopics(req.user._id);
    const user = await User.findById(req.user._id);

    const generatedTasks = await getAIStudyPlan({
      hoursAvailable: Number(hoursAvailable),
      targetRole: targetRole || user.targetRole,
      weakTopics,
      apiKey: user.settings?.geminiApiKey
    });

    const today = new Date().toISOString().split('T')[0];
    const createdTasks = [];

    for (const t of generatedTasks) {
      const task = await DailyTask.create({
        userId: req.user._id,
        date: today,
        subject: t.subject,
        topic: t.topic,
        subtopic: t.subtopic || '',
        timeSlot: t.timeSlot || 'Morning',
        estimatedDuration: t.estimatedDuration || 45,
        difficulty: t.difficulty || 'Medium',
        priority: t.priority || 'Medium',
        notes: t.notes || 'AI-recommended milestone based on weak areas',
        status: 'Not Started',
        isCompleted: false
      });
      createdTasks.push(task);
    }

    res.status(201).json({
      message: `Generated ${createdTasks.length} optimized daily tasks`,
      tasks: createdTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
