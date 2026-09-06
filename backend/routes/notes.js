import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Note from '../models/Note.js';

const router = express.Router();

// GET /api/notes
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, tag } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { topicName: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/notes
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, topicId, subjectName, topicName, tags, category, isPinned } = req.body;

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      topicId,
      subjectName: subjectName || 'General',
      topicName: topicName || 'General',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(s => s.trim()) : []),
      category: category || 'Summary',
      isPinned: Boolean(isPinned)
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notes/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    Object.assign(note, req.body);
    const updated = await note.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
