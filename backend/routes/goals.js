import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Goal from '../models/Goal.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/goals
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/goals
router.post('/', protect, async (req, res) => {
  try {
    const { title, category, targetValue, unit, deadline, dailyTarget, notes } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      category: category || 'General',
      targetValue: Number(targetValue) || 10,
      currentValue: 0,
      unit: unit || 'items',
      deadline,
      dailyTarget: Number(dailyTarget) || 1,
      notes: notes || '',
      status: 'In Progress'
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (req.body.currentValue !== undefined) {
      goal.currentValue = Number(req.body.currentValue);
      if (goal.currentValue >= goal.targetValue) {
        goal.status = 'Completed';
        await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 100 } });
      }
    }
    if (req.body.status) goal.status = req.body.status;
    if (req.body.title) goal.title = req.body.title;
    if (req.body.deadline) goal.deadline = req.body.deadline;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
