import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import UserTopicProgress from '../models/UserTopicProgress.js';

const router = express.Router();

// GET /api/subjects
router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ order: 1 });
    const userProgress = await UserTopicProgress.find({ userId: req.user._id });

    const subjectData = await Promise.all(subjects.map(async (subj) => {
      const topicCount = await Topic.countDocuments({ subjectId: subj._id });
      const completedCount = userProgress.filter(p => 
        p.subjectId.toString() === subj._id.toString() && 
        (p.status === 'Completed' || p.status === 'Mastered')
      ).length;

      const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;

      return {
        ...subj.toObject(),
        totalTopicsCount: topicCount || subj.totalTopicsCount,
        completedTopicsCount: completedCount,
        progressPercentage: progress
      };
    }));

    res.json(subjectData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/subjects
router.post('/', protect, async (req, res) => {
  try {
    const { name, category, description, icon, color } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const subject = await Subject.create({
      name,
      slug,
      category: category || 'Core Computer Science',
      description,
      icon: icon || 'BookOpen',
      color: color || 'from-indigo-500 to-purple-600',
      isCustom: true
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/subjects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/subjects/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    subject.name = req.body.name || subject.name;
    subject.category = req.body.category || subject.category;
    subject.description = req.body.description || subject.description;
    subject.icon = req.body.icon || subject.icon;
    subject.color = req.body.color || subject.color;

    const updated = await subject.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/subjects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (!subject.isCustom) {
      return res.status(400).json({ message: 'Standard curriculum subjects cannot be deleted' });
    }

    await Subject.findByIdAndDelete(req.params.id);
    await Topic.deleteMany({ subjectId: req.params.id });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
