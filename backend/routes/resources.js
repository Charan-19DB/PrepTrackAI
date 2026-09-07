import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import LearningResource from '../models/LearningResource.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';

const router = express.Router();

// Seed baseline curated resources if collection is empty
const seedDefaultResources = async () => {
  const count = await LearningResource.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        title: 'Operating System Deadlocks: 4 Conditions & Banker\'s Algorithm',
        url: 'https://www.geeksforgeeks.org/introduction-of-deadlock-in-operating-system/',
        type: 'Article',
        subject: 'Operating Systems',
        topic: 'Deadlocks',
        difficulty: 'Intermediate',
        source: 'GeeksforGeeks',
        duration: '15 mins',
        channelOrAuthor: 'CS Core Team'
      },
      {
        title: 'Deadlock Detection and Recovery - Full Course Lecture',
        url: 'https://www.youtube.com/watch?v=Uv9Oj9r_dOQ',
        type: 'YouTube',
        subject: 'Operating Systems',
        topic: 'Deadlocks',
        difficulty: 'Intermediate',
        source: 'YouTube',
        duration: '22 mins',
        channelOrAuthor: 'Gate Smashers'
      },
      {
        title: 'Database Normalization: 1NF, 2NF, 3NF, and BCNF Explained with Examples',
        url: 'https://www.geeksforgeeks.org/database-normalization-introduction/',
        type: 'Article',
        subject: 'DBMS and SQL',
        topic: 'Normalization',
        difficulty: 'Intermediate',
        source: 'GeeksforGeeks',
        duration: '20 mins',
        channelOrAuthor: 'DBMS Placement Team'
      },
      {
        title: 'DBMS Normalization BCNF & 3NF Lossless Decomposition',
        url: 'https://www.youtube.com/watch?v=5fs1hdkhdt8',
        type: 'YouTube',
        subject: 'DBMS and SQL',
        topic: 'Normalization',
        difficulty: 'Intermediate',
        source: 'YouTube',
        duration: '28 mins',
        channelOrAuthor: 'Gate Smashers'
      },
      {
        title: 'B+ Tree Indexing in Relational Databases Deep Dive',
        url: 'https://use-the-index-luke.com/',
        type: 'Documentation',
        subject: 'DBMS and SQL',
        topic: 'Indexing',
        difficulty: 'Advanced',
        source: 'Use The Index Luke',
        duration: '35 mins',
        channelOrAuthor: 'Markus Winand'
      },
      {
        title: 'Sliding Window Technique for FAANG Coding Interviews',
        url: 'https://leetcode.com/discuss/study-guide/3630424/sliding-window-algorithm-for-beginners',
        type: 'Practice',
        subject: 'Data Structures and Algorithms',
        topic: 'Sliding Window',
        difficulty: 'Intermediate',
        source: 'LeetCode Discuss',
        duration: '25 mins',
        channelOrAuthor: 'LeetCode Community'
      },
      {
        title: 'TCP 3-Way Handshake and Connection Teardown Mechanics',
        url: 'https://www.youtube.com/watch?v=bW_kWXiqLcw',
        type: 'YouTube',
        subject: 'Computer Networks',
        topic: 'TCP/IP Model',
        difficulty: 'Intermediate',
        source: 'YouTube',
        duration: '18 mins',
        channelOrAuthor: 'NetworkChuck'
      }
    ];

    await LearningResource.insertMany(defaults);
  }
};

seedDefaultResources().catch(console.error);

// GET /api/resources
router.get('/', protect, async (req, res) => {
  try {
    const { type, subject, savedOnly, completedOnly } = req.query;
    const query = {};

    if (type && type !== 'All') query.type = type;
    if (subject && subject !== 'All') query.subject = subject;
    if (savedOnly === 'true') query.savedBy = req.user._id;
    if (completedOnly === 'true') query.completedBy = req.user._id;

    const resources = await LearningResource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/resources/recommended
router.get('/recommended', protect, async (req, res) => {
  try {
    const weakTopics = await detectWeakTopics(req.user._id);
    const weakTopicNames = weakTopics.map(w => w.topic);

    let recommended = await LearningResource.find({
      $or: [
        { topic: { $in: weakTopicNames } },
        { subject: { $in: weakTopics.map(w => w.subject) } }
      ]
    }).limit(10);

    // If none match specific weak topics, return top curated
    if (recommended.length === 0) {
      recommended = await LearningResource.find().limit(6);
    }

    res.json({
      weakTopics: weakTopics.slice(0, 4),
      resources: recommended
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resources/:id/toggle-save
router.post('/:id/toggle-save', protect, async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const isSaved = resource.savedBy.some(id => id.toString() === req.user._id.toString());
    if (isSaved) {
      resource.savedBy = resource.savedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      resource.savedBy.push(req.user._id);
    }

    await resource.save();
    res.json({ saved: !isSaved, resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/resources/:id/toggle-complete
router.post('/:id/toggle-complete', protect, async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const isCompleted = resource.completedBy.some(id => id.toString() === req.user._id.toString());
    if (isCompleted) {
      resource.completedBy = resource.completedBy.filter(id => id.toString() !== req.user._id.toString());
    } else {
      resource.completedBy.push(req.user._id);
    }

    await resource.save();
    res.json({ completed: !isCompleted, resource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
