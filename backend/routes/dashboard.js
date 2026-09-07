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
import { calculatePlacementReadiness } from '../services/placementReadinessCalculator.js';

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
    
    const completedTopicsCount = userProgressList.filter(p => p.status === 'Completed' || p.status === 'Mastered').length;
    const inProgressTopicsCount = userProgressList.filter(p => p.status === 'Learning' || p.status === 'Practicing').length;
    const notStartedTopicsCount = Math.max(0, totalTopics - completedTopicsCount - inProgressTopicsCount);
    const overallCompletionPercent = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    // 4. DSA Stats
    const dsaSolvedCount = await DSAProblem.countDocuments({
      userId,
      status: { $in: ['Solved', 'Mastered'] }
    });

    // 5. Practice & Accuracy Stats
    const attempts = await PracticeAttempt.find({ userId });
    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // 6. Study Time Today & Total
    const todaySessions = await StudySession.find({ userId, date: today });
    const todayStudyMinutes = todaySessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const allUserSessions = await StudySession.find({ userId });
    const allUserMinutes = allUserSessions.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
    const totalStudyHours = ((user?.studyStats?.totalMinutes || 0) + allUserMinutes) / 60;

    // 7. Revise Today (Spaced Repetition)
    const todayRevisions = await Revision.find({
      userId,
      scheduledDate: { $lte: today },
      status: 'Pending'
    }).limit(5);

    // 8. Pending Mistakes Count
    const pendingMistakesCount = await Mistake.countDocuments({ userId, resolved: false });

    // 9. Dynamic Weak Topics Detection (with strength scores 0-100)
    const weakTopics = await detectWeakTopics(userId);

    // 10. Placement Readiness Score (0-100 across 6 dimensions)
    const placementReadiness = await calculatePlacementReadiness(userId);

    // 11. Today's AI Priority Schedule
    const todayPrioritySchedule = [
      {
        id: 1,
        title: weakTopics[0] ? `${weakTopics[0].subject} — ${weakTopics[0].topic}` : 'Operating Systems — Deadlocks',
        durationMinutes: 30,
        type: 'Weak Area Concept',
        reason: weakTopics[0]?.reason || 'Scored below 45% in recent diagnostic assessment',
        badge: weakTopics[0]?.emoji || '🔴',
        link: '/practice'
      },
      {
        id: 2,
        title: todayRevisions[0] ? `Revise: ${todayRevisions[0].topicName}` : 'DBMS — Normalization',
        durationMinutes: 20,
        type: 'Spaced Repetition',
        reason: todayRevisions[0] ? `Revision stage ${todayRevisions[0].revisionStage || 1} due today for long-term retention` : 'Overdue for revision based on spacing algorithm',
        badge: '🔁',
        link: '/revisions'
      },
      {
        id: 3,
        title: 'DSA: Sliding Window & Arrays',
        durationMinutes: 25,
        type: 'Coding Mastery',
        reason: 'High frequency placement pattern for target role',
        badge: '💻',
        link: '/dsa'
      },
      {
        id: 4,
        title: 'Communication & Speaking Practice',
        durationMinutes: 15,
        type: 'Interview Readiness',
        reason: 'Bottleneck identified: improve fluency and reduce conversational fillers',
        badge: '🎤',
        link: '/interview/practice'
      }
    ];

    // 12. Motivational Quote / Greeting
    const streak = user?.streak?.currentStreak || 0;
    let motivationalMessage = `Welcome, ${user.name}! Start your first study session or topic today to build your placement streak.`;
    if (streak >= 10) {
      motivationalMessage = `🔥 ${streak}-day streak! Keep going ${user.name}, you are in the top tier of consistency!`;
    } else if (streak > 0) {
      motivationalMessage = `🔥 ${streak}-day streak! You are making consistent progress toward your dream placement.`;
    }

    const completedTodayTasks = todayTasks.filter(t => t.isCompleted).length;
    const todayProgressPercentage = todayTasks.length > 0 
      ? Math.round((completedTodayTasks / todayTasks.length) * 100) 
      : 0;

    const interviewPracticedCount = attempts.filter(a => a.category === 'Interview Conceptual').length || (user?.studyStats?.interviewQuestionsPracticed || 0);

    res.json({
      user: {
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || { currentStreak: 0, longestStreak: 0 }
      },
      motivationalMessage,
      metrics: {
        todayProgressPercentage,
        todayStudyMinutes,
        totalStudyHoursFormatted: `${Math.floor(totalStudyHours)}h ${Math.round((totalStudyHours % 1) * 60)}m`,
        topicsCompleted: completedTopicsCount,
        totalTopics,
        topicsInProgress: inProgressTopicsCount,
        topicsNotStarted: notStartedTopicsCount,
        overallCompletionPercentage: overallCompletionPercent,
        dsaSolvedCount,
        accuracyPercentage: accuracy,
        pendingMistakesCount,
        interviewPracticedCount
      },
      todayTasks,
      todayRevisions,
      weakTopics,
      placementReadiness,
      todayPrioritySchedule
    });
  } catch (error) {
    console.error('[Dashboard API Error]:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
