import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import Note from '../models/Note.js';
import DSAProblem from '../models/DSAProblem.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import Project from '../models/Project.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const queryStr = q.trim();
    const regex = { $regex: queryStr, $options: 'i' };

    const [subjects, topics, notes, dsaProblems, interviewQuestions, projects] = await Promise.all([
      Subject.find({ name: regex }).limit(5),
      Topic.find({ $or: [{ name: regex }, { subtopics: regex }] }).limit(8),
      Note.find({ userId: req.user._id, $or: [{ title: regex }, { content: regex }] }).limit(5),
      DSAProblem.find({ userId: req.user._id, title: regex }).limit(5),
      InterviewQuestion.find({ $or: [{ question: regex }, { topic: regex }] }).limit(5),
      Project.find({ userId: req.user._id, title: regex }).limit(4)
    ]);

    const results = [
      ...subjects.map(s => ({ type: 'Subject', title: s.name, subtitle: s.category, url: `/roadmap` })),
      ...topics.map(t => ({ type: 'Topic', title: t.name, subtitle: t.subjectName, url: `/topics/${t._id}` })),
      ...dsaProblems.map(d => ({ type: 'DSA', title: d.title, subtitle: `${d.category} • ${d.difficulty}`, url: `/dsa` })),
      ...interviewQuestions.map(i => ({ type: 'Interview', title: i.question, subtitle: i.category, url: `/interview` })),
      ...notes.map(n => ({ type: 'Note', title: n.title, subtitle: n.topicName, url: `/notes` })),
      ...projects.map(p => ({ type: 'Project', title: p.title, subtitle: p.technologies.join(', '), url: `/projects` }))
    ];

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
