import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import DSAProblem from '../models/DSAProblem.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/dsa
router.get('/', protect, async (req, res) => {
  try {
    const { category, difficulty, status, platform, revisit, search } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (status && status !== 'All') query.status = status;
    if (platform && platform !== 'All') query.platform = platform;
    if (revisit === 'true') query.revisitRequired = true;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const problems = await DSAProblem.find(query).sort({ updatedAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/dsa/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const problems = await DSAProblem.find({ userId: req.user._id });

    const total = problems.length;
    const solved = problems.filter(p => p.status === 'Solved' || p.status === 'Mastered').length;
    const revisit = problems.filter(p => p.revisitRequired || p.status === 'Revisit').length;

    const byDifficulty = {
      Easy: problems.filter(p => p.difficulty === 'Easy' && (p.status === 'Solved' || p.status === 'Mastered')).length,
      Medium: problems.filter(p => p.difficulty === 'Medium' && (p.status === 'Solved' || p.status === 'Mastered')).length,
      Hard: problems.filter(p => p.difficulty === 'Hard' && (p.status === 'Solved' || p.status === 'Mastered')).length
    };

    const categoryMap = {};
    problems.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { total: 0, solved: 0 };
      }
      categoryMap[p.category].total += 1;
      if (p.status === 'Solved' || p.status === 'Mastered') {
        categoryMap[p.category].solved += 1;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      total: categoryMap[cat].total,
      solved: categoryMap[cat].solved,
      percentage: Math.round((categoryMap[cat].solved / categoryMap[cat].total) * 100)
    }));

    res.json({
      totalCount: total,
      solvedCount: solved,
      revisitCount: revisit,
      byDifficulty,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/dsa
router.post('/', protect, async (req, res) => {
  try {
    const { title, platform, url, difficulty, category, status, attempts, timeTakenMinutes, solutionNotes, timeComplexity, spaceComplexity, revisitRequired } = req.body;

    const problem = await DSAProblem.create({
      userId: req.user._id,
      title,
      platform: platform || 'LeetCode',
      url: url || '',
      difficulty: difficulty || 'Medium',
      category: category || 'Arrays',
      status: status || 'Not Started',
      attempts: Number(attempts) || 0,
      timeTakenMinutes: Number(timeTakenMinutes) || 0,
      solutionNotes: solutionNotes || '',
      timeComplexity: timeComplexity || '',
      spaceComplexity: spaceComplexity || '',
      revisitRequired: Boolean(revisitRequired),
      solvedAt: (status === 'Solved' || status === 'Mastered') ? new Date() : null
    });

    if (status === 'Solved' || status === 'Mastered') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'studyStats.dsaSolvedCount': 1, xp: 30 }
      });
    }

    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/dsa/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const problem = await DSAProblem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!problem) return res.status(404).json({ message: 'DSA Problem not found' });

    const wasSolved = problem.status === 'Solved' || problem.status === 'Mastered';

    Object.assign(problem, req.body);

    const isNowSolved = problem.status === 'Solved' || problem.status === 'Mastered';
    if (!wasSolved && isNowSolved) {
      problem.solvedAt = new Date();
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'studyStats.dsaSolvedCount': 1, xp: 30 }
      });
    }

    const updated = await problem.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/dsa/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const problem = await DSAProblem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
