import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Revision from '../models/Revision.js';
import User from '../models/User.js';
import { scheduleTopicRevision } from '../services/spacedRepetition.js';

const router = express.Router();

// GET /api/revisions/today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const revisions = await Revision.find({
      userId: req.user._id,
      scheduledDate: { $lte: today },
      status: 'Pending'
    }).sort({ scheduledDate: 1 });

    res.json(revisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/revisions
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };
    if (status && status !== 'All') query.status = status;

    const revisions = await Revision.find(query).sort({ scheduledDate: 1 });
    res.json(revisions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/revisions (manually add a revision)
router.post('/', protect, async (req, res) => {
  try {
    const { subjectName, topicName, scheduledDate, notes } = req.body;
    const targetDate = scheduledDate || new Date().toISOString().split('T')[0];

    const revision = await Revision.create({
      userId: req.user._id,
      subjectName,
      topicName,
      scheduledDate: targetDate,
      notes: notes || '',
      revisionStage: 1,
      status: 'Pending'
    });

    res.status(201).json(revision);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/revisions/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const { retentionRating = 5, notes } = req.body;
    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user._id });
    if (!revision) return res.status(404).json({ message: 'Revision item not found' });

    revision.status = 'Completed';
    revision.completedAt = new Date();
    revision.retentionRating = Number(retentionRating) || 5;
    if (notes) revision.notes = notes;
    await revision.save();

    // If stage < 5, automatically schedule next spaced repetition stage
    let nextRevision = null;
    if (revision.revisionStage < 5) {
      const nextStage = revision.revisionStage + 1;
      nextRevision = await scheduleTopicRevision(
        req.user._id,
        revision.topicId,
        revision.subjectName,
        revision.topicName,
        nextStage
      );
    }

    // Award XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 20 } });

    res.json({
      message: 'Revision completed successfully!',
      revision,
      nextRevisionScheduled: nextRevision
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/revisions/:id/reschedule
router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { scheduledDate } = req.body;
    const revision = await Revision.findOne({ _id: req.params.id, userId: req.user._id });
    if (!revision) return res.status(404).json({ message: 'Revision item not found' });

    revision.scheduledDate = scheduledDate;
    revision.status = 'Rescheduled';
    await revision.save();

    res.json(revision);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
