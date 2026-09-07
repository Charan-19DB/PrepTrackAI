import PracticeAttempt from '../models/PracticeAttempt.js';
import Mistake from '../models/Mistake.js';
import UserTopicProgress from '../models/UserTopicProgress.js';

export const getCategoryFromScore = (score) => {
  if (score <= 30) return { category: 'Critical Weakness', color: 'rose', emoji: '🔴', status: 'critical' };
  if (score <= 50) return { category: 'Weak', color: 'amber', emoji: '🟠', status: 'weak' };
  if (score <= 70) return { category: 'Needs Improvement', color: 'yellow', emoji: '🟡', status: 'improving' };
  if (score <= 85) return { category: 'Good', color: 'blue', emoji: '🔵', status: 'good' };
  return { category: 'Strong', color: 'emerald', emoji: '🟢', status: 'mastered' };
};

export const detectWeakTopics = async (userId) => {
  try {
    // 1. Analyze practice attempts by topic
    const attempts = await PracticeAttempt.find({ userId }).lean();
    const topicStats = {};

    attempts.forEach(attempt => {
      const key = `${attempt.subject}:::${attempt.topic}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          subject: attempt.subject,
          topic: attempt.topic,
          total: 0,
          correct: 0,
          totalSeconds: 0
        };
      }
      topicStats[key].total += 1;
      topicStats[key].totalSeconds += (attempt.timeTakenSeconds || 0);
      if (attempt.isCorrect) {
        topicStats[key].correct += 1;
      }
    });

    // 2. Count unresolved mistakes per topic
    const mistakes = await Mistake.find({ userId, resolved: false }).lean();
    mistakes.forEach(mistake => {
      const key = `${mistake.subject}:::${mistake.topic}`;
      if (!topicStats[key]) {
        topicStats[key] = {
          subject: mistake.subject,
          topic: mistake.topic,
          total: 2,
          correct: 0,
          totalSeconds: 0
        };
      } else {
        topicStats[key].total += 1; // treat mistake as additional penalty signal
      }
    });

    // 3. User topic progress signals
    const progresses = await UserTopicProgress.find({ userId }).lean();
    progresses.forEach(prog => {
      if (prog.topicName) {
        const key = `${prog.subjectName || 'Core CS'}:::${prog.topicName}`;
        if (!topicStats[key]) {
          topicStats[key] = {
            subject: prog.subjectName || 'Core CS',
            topic: prog.topicName,
            total: 1,
            correct: prog.progress >= 80 ? 1 : 0,
            totalSeconds: 0
          };
        }
      }
    });

    // Calculate dynamic Topic Strength Score (0 - 100)
    const topicList = Object.values(topicStats).map(item => {
      const accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      // Strength score penalized by mistake frequency
      const strengthScore = Math.max(0, Math.min(100, accuracy));
      const categoryInfo = getCategoryFromScore(strengthScore);
      const incorrectCount = item.total - item.correct;

      let reason = `You answered ${incorrectCount}/${item.total} questions incorrectly in recent sessions.`;
      if (strengthScore <= 30) {
        reason = `Critical deficiency: ${incorrectCount} failed attempts. Immediate concept recovery needed.`;
      } else if (strengthScore <= 50) {
        reason = `${incorrectCount} mistakes logged across recent assessments.`;
      }

      return {
        subject: item.subject,
        topic: item.topic,
        strengthScore,
        accuracy,
        attemptsCount: item.total,
        incorrectCount,
        category: categoryInfo.category,
        emoji: categoryInfo.emoji,
        color: categoryInfo.color,
        status: categoryInfo.status,
        reason,
        recommendedTimeMinutes: strengthScore < 45 ? 45 : 30,
        recommendation: `Spend ${strengthScore < 45 ? 45 : 30} minutes revising ${item.topic} concepts and practicing 5 questions.`
      };
    });

    // Sort by lowest strength score first
    topicList.sort((a, b) => a.strengthScore - b.strengthScore);

    if (topicList.length > 0) {
      return topicList;
    }

    // Default placement benchmark topics if new user with no attempts yet
    return [
      {
        subject: 'DBMS and SQL',
        topic: 'Indexing',
        strengthScore: 31,
        accuracy: 31,
        attemptsCount: 8,
        incorrectCount: 6,
        category: 'Weak',
        emoji: '🔴',
        color: 'rose',
        status: 'critical',
        reason: 'Diagnostic baseline: Candidate struggled with B+ Tree clustered index vs non-clustered index traversals.',
        recommendedTimeMinutes: 45,
        recommendation: 'Spend 45 minutes studying B+ Tree indexing mechanisms and query optimization.'
      },
      {
        subject: 'Operating Systems',
        topic: 'Deadlocks',
        strengthScore: 38,
        accuracy: 38,
        attemptsCount: 7,
        incorrectCount: 5,
        category: 'Weak',
        emoji: '🔴',
        color: 'rose',
        status: 'critical',
        reason: 'Frequent mistakes on the 4 Coffman conditions and Resource Allocation Graphs.',
        recommendedTimeMinutes: 40,
        recommendation: 'Spend 40 minutes reviewing Deadlock conditions, prevention, and Banker\'s algorithm.'
      },
      {
        subject: 'DBMS and SQL',
        topic: 'Normalization',
        strengthScore: 43,
        accuracy: 43,
        attemptsCount: 9,
        incorrectCount: 5,
        category: 'Weak',
        emoji: '🟠',
        color: 'amber',
        status: 'weak',
        reason: 'Struggled identifying BCNF vs 3NF functional dependencies and lossy decomposition.',
        recommendedTimeMinutes: 35,
        recommendation: 'Review Armstrong axioms and practice 5 normalization decomposition problems.'
      },
      {
        subject: 'Computer Networks',
        topic: 'TCP/IP Model',
        strengthScore: 48,
        accuracy: 48,
        attemptsCount: 6,
        incorrectCount: 3,
        category: 'Weak',
        emoji: '🟠',
        color: 'amber',
        status: 'weak',
        reason: 'Missed questions regarding TCP 3-way handshake and congestion control window mechanics.',
        recommendedTimeMinutes: 30,
        recommendation: 'Spend 30 minutes revising TCP/IP 4-layer architecture and sliding window flow control.'
      }
    ];
  } catch (error) {
    console.error('[Weak Topic Detection Error]:', error.message);
    return [];
  }
};
