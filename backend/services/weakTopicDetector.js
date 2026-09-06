import PracticeAttempt from '../models/PracticeAttempt.js';
import Mistake from '../models/Mistake.js';
import UserTopicProgress from '../models/UserTopicProgress.js';

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
          correct: 0
        };
      }
      topicStats[key].total += 1;
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
          correct: 0
        };
      } else {
        topicStats[key].total += 1; // treat mistake as additional signal
      }
    });

    // Calculate accuracy percentages
    const weakList = Object.values(topicStats)
      .map(item => {
        const accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
        return {
          subject: item.subject,
          topic: item.topic,
          accuracy,
          attemptsCount: item.total,
          recommendedTimeMinutes: accuracy < 45 ? 50 : 35,
          recommendation: `You should spend ${accuracy < 45 ? 50 : 35} minutes revising ${item.topic} today.`
        };
      })
      .filter(item => item.accuracy < 70) // Below 70% considered weak
      .sort((a, b) => a.accuracy - b.accuracy);

    if (weakList.length > 0) {
      return weakList.slice(0, 5);
    }

    // Default recommendations if no attempts yet
    return [
      {
        subject: 'Quantitative Aptitude',
        topic: 'Probability',
        accuracy: 42,
        attemptsCount: 7,
        recommendedTimeMinutes: 45,
        recommendation: 'Spend 45 minutes revising Probability and Bayes Theorem formulas today.'
      },
      {
        subject: 'Operating Systems',
        topic: 'Deadlocks',
        accuracy: 48,
        attemptsCount: 8,
        recommendedTimeMinutes: 40,
        recommendation: 'Spend 40 minutes reviewing Deadlock conditions and Banker\'s algorithm.'
      },
      {
        subject: 'DBMS and SQL',
        topic: 'Joins',
        accuracy: 55,
        attemptsCount: 10,
        recommendedTimeMinutes: 30,
        recommendation: 'Practice 5 complex multi-table SQL JOIN queries today.'
      }
    ];
  } catch (error) {
    console.error('[Weak Topic Detection Error]:', error.message);
    return [];
  }
};
