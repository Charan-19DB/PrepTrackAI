import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl, features, status, progress, skillsDemonstrated, interviewPitch } = req.body;

    const project = await Project.create({
      userId: req.user._id,
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : (technologies ? technologies.split(',').map(s => s.trim()) : []),
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      features: features || [{ title: 'Initial architecture & schema', completed: true }],
      status: status || 'In Progress',
      progress: Number(progress) || 20,
      skillsDemonstrated: Array.isArray(skillsDemonstrated) ? skillsDemonstrated : (skillsDemonstrated ? skillsDemonstrated.split(',').map(s => s.trim()) : []),
      interviewPitch: interviewPitch || ''
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50 } });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    Object.assign(project, req.body);
    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
