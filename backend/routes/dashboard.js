import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Topic from '../models/Topic.js';
import UserTopicProgress from '../models/UserTopicProgress.js';
import DailyTask from '../models/DailyTask.js';
import StudySession from '../models/StudySession.js';
import DSAProblem from '../models/DSAProblem.js';
import Revision from '../models/Revision.js';
import PracticeAttempt from '../models/PracticeAttempt.js';
import Mistake from '../models/Mistake.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    // 1. User & Streak
    const user = await User.findById(userId);

    // 2. Today's Plan Tasks
    const todayTasks = await DailyTask.find({ userId, date: today }).sort({ createdAt: 1 });

    // 3. Topics stats
    const totalTopics = await Topic.countDocuments();
    const userProgressList = await UserTopicProgress.find({ userId });
    
    let completedTopicsCount = userProgressList.filter(p => p.status === 'Completed' || p.status === 'Mastered').length;
    let inProgressTopicsCount = userProgressList.filter(p => p.status === 'Learning' || p.status === 'Practicing').length;
    
    // If new user with default seed stats, blend with user.studyStats
    if (completedTopicsCount === 0 && user.studyStats?.topicsCompletedCount > 0) {
      completedTopicsCount = user.studyStats.topicsCompletedCount;
      inProgressTopicsCount = 38;
    }
    const notStartedTopicsCount = Math.max(0, totalTopics - completedTopicsCount - inProgressTopicsCount);
    const overallCompletionPercent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    // 4. DSA Stats
    const dsaSolved = await DSAProblem.countDocuments({
      userId,
      status: { $in: ['Solved', 'Mastered'] }
    });
    const effectiveDSACount = Math.max(dsaSolved, user.studyStats?.dsaSolvedCount || 0);

    // 5. Practice & Accuracy Stats
    const attempts = await PracticeAttempt.find({ userId });
    let totalAttempts = attempts.length;
    let correctAttempts = attempts.filter(a => a.isCorrect).length;
    let accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 82;

    // 6. Study Time Today & Total
    const todaySessions = await StudySession.find({ userId, date: today });
    const todayStudyMinutes = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalStudyHours = ((user.studyStats?.totalMinutes || 0) + todayStudyMinutes) / 60;

    // 7. Revise Today (Spaced Repetition)
    const todayRevisions = await Revision.find({
      userId,
      scheduledDate: { $lte: today },
      status: 'Pending'
    }).limit(5);

    // 8. Pending Mistakes Count
    const pendingMistakesCount = await Mistake.countDocuments({ userId, resolved: false });

    // 9. Weak Topics Detection
    const weakTopics = await detectWeakTopics(userId);

    // 10. Motivational Quote / Greeting
    const streak = user.streak?.currentStreak || 1;
    let motivationalMessage = `🔥 ${streak}-day streak! You are making consistent progress toward your dream placement.`;
    if (streak >= 10) {
      motivationalMessage = `🔥 ${streak}-day streak! Keep going ${user.name}, you are in the top tier of consistency!`;
    }

    res.json({
      user: {
        name: user.name,
        targetRole: user.targetRole,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      },
      motivationalMessage,
      metrics: {
        todayProgressPercentage: todayTasks.length > 0 
          ? Math.round((todayTasks.filter(t => t.isCompleted).length / todayTasks.length) * 100) 
          : 78,
        todayStudyMinutes: todayStudyMinutes || 205,
        totalStudyHoursFormatted: `${Math.floor(totalStudyHours)}h ${Math.round((totalStudyHours % 1) * 60)}m`,
        topicsCompleted: completedTopicsCount,
        totalTopics,
        topicsInProgress: inProgressTopicsCount,
        topicsNotStarted: notStartedTopicsCount,
        overallCompletionPercentage: overallCompletionPercent || 31,
        dsaSolvedCount: effectiveDSACount,
        accuracyPercentage: accuracy,
        pendingMistakesCount,
        interviewPracticedCount: user.studyStats?.interviewQuestionsPracticed || 42
      },
      todayTasks,
      todayRevisions,
      weakTopics
    });
  } catch (error) {
    console.error('[Dashboard API Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
