import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import StudySession from '../models/StudySession.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import UserTopicProgress from '../models/UserTopicProgress.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import DSAProblem from '../models/DSAProblem.js';
import DailyTask from '../models/DailyTask.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Daily Study Hours (Last 14 days)
    const dailyStudy = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      dailyStudy.push({
        date: dateStr,
        label: dayLabel,
        minutes: 0,
        hours: 0
      });
    }

    const sessions = await StudySession.find({
      userId,
      date: { $gte: dailyStudy[0].date }
    });

    const sessionMap = {};
    sessions.forEach(s => {
      sessionMap[s.date] = (sessionMap[s.date] || 0) + s.durationMinutes;
    });

    // Provide real preparation data for this user
    dailyStudy.forEach((day) => {
      day.minutes = sessionMap[day.date] || 0;
      day.hours = +(day.minutes / 60).toFixed(1);
    });

    // 2. Weekly Study Hours (Last 6 weeks)
    const weeklyStudy = [];
    const allUserSessions = await StudySession.find({ userId });
    for (let w = 5; w >= 0; w--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (w * 7) - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (w * 7));
      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      const weekSessions = allUserSessions.filter(s => s.date >= startStr && s.date <= endStr);
      const weekMinutes = weekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      const weekHours = +(weekMinutes / 60).toFixed(1);

      weeklyStudy.push({
        week: w === 0 ? 'Current' : `W-${w}`,
        hours: weekHours,
        target: 15
      });
    }

    // 3. Subject Completion Breakdown
    const subjects = await Subject.find().sort({ order: 1 });
    const userProgress = await UserTopicProgress.find({ userId });

    const subjectBreakdown = await Promise.all(subjects.map(async (sub) => {
      const topicCount = await Topic.countDocuments({ subjectId: sub._id });
      const completed = userProgress.filter(p =>
        p.subjectId.toString() === sub._id.toString() &&
        (p.status === 'Completed' || p.status === 'Mastered')
      ).length;

      const percentage = topicCount > 0 ? Math.round((completed / topicCount) * 100) : 0;

      return {
        subject: sub.name,
        slug: sub.slug,
        category: sub.category,
        totalTopics: topicCount || sub.totalTopicsCount,
        completedTopics: completed,
        percentage
      };
    }));

    // 4. DSA Progress by Difficulty
    const dsaProblems = await DSAProblem.find({ userId });
    const dsaByDifficulty = [
      { name: 'Easy', solved: dsaProblems.filter(p => p.difficulty === 'Easy' && (p.status === 'Solved' || p.status === 'Mastered')).length, total: 35 },
      { name: 'Medium', solved: dsaProblems.filter(p => p.difficulty === 'Medium' && (p.status === 'Solved' || p.status === 'Mastered')).length, total: 50 },
      { name: 'Hard', solved: dsaProblems.filter(p => p.difficulty === 'Hard' && (p.status === 'Solved' || p.status === 'Mastered')).length, total: 20 }
    ];

    // 5. Practice Accuracy by Category
    const attempts = await PracticeAttempt.find({ userId });
    const categories = ['MCQs', 'DSA / Coding', 'Aptitude', 'SQL Queries', 'Output Prediction', 'Interview Conceptual'];
    const practiceAccuracy = categories.map(cat => {
      const catAttempts = attempts.filter(a => a.category === cat);
      const correct = catAttempts.filter(a => a.isCorrect).length;
      const accuracy = catAttempts.length > 0 ? Math.round((correct / catAttempts.length) * 100) : 0;
      return { category: cat, accuracy };
    });

    // 6. Placement Readiness Score (0 - 100)
    const user = await User.findById(userId);
    const avgSubjectCompletion = subjectBreakdown.length > 0
      ? Math.round(subjectBreakdown.reduce((a, b) => a + b.percentage, 0) / subjectBreakdown.length)
      : 0;
    const streakBonus = Math.min(100, (user?.streak?.currentStreak || 0) * 8);
    const totalAttempts = attempts.length;
    const overallAccuracy = totalAttempts > 0
      ? Math.round((attempts.filter(a => a.isCorrect).length / totalAttempts) * 100)
      : 0;
    const dsaSolvedTotal = dsaProblems.filter(p => p.status === 'Solved' || p.status === 'Mastered').length;

    const readinessScore = Math.min(100, Math.round(
      (0.3 * Math.min(100, dsaSolvedTotal * 1.5)) +
      (0.3 * avgSubjectCompletion) +
      (0.2 * overallAccuracy) +
      (0.2 * streakBonus)
    ));

    // 7. 365-day GitHub-style Contribution Heatmap
    const activityMap = {};
    allUserSessions.forEach(s => {
      if (s.date) activityMap[s.date] = (activityMap[s.date] || 0) + 1;
    });
    const userTasksAll = await DailyTask.find({ userId, isCompleted: true });
    userTasksAll.forEach(t => {
      if (t.date) activityMap[t.date] = (activityMap[t.date] || 0) + 1;
    });
    attempts.forEach(a => {
      const aDate = a.createdAt ? a.createdAt.toISOString().split('T')[0] : '';
      if (aDate) activityMap[aDate] = (activityMap[aDate] || 0) + 1;
    });

    const heatmap = [];
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);

    for (let i = 0; i < 365; i++) {
      const d = new Date(oneYearAgo);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      heatmap.push({
        date: dStr,
        count: activityMap[dStr] || 0
      });
    }

    res.json({
      readinessScore,
      dailyStudy,
      weeklyStudy,
      subjectBreakdown: subjectBreakdown.slice(0, 10),
      dsaByDifficulty,
      practiceAccuracy,
      heatmap
    });
  } catch (error) {
    console.error('[Analytics Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
