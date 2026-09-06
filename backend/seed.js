import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Subject from './models/Subject.js';
import Topic from './models/Topic.js';
import UserTopicProgress from './models/UserTopicProgress.js';
import DailyTask from './models/DailyTask.js';
import StudySession from './models/StudySession.js';
import DSAProblem from './models/DSAProblem.js';
import PracticeQuestion from './models/PracticeQuestion.js';
import PracticeAttempt from './models/PracticeAttempt.js';
import InterviewQuestion from './models/InterviewQuestion.js';
import Revision from './models/Revision.js';
import Mistake from './models/Mistake.js';
import Goal from './models/Goal.js';
import Project from './models/Project.js';

import { syllabusData, generateTopicChecklists } from './data/syllabusSeed.js';
import { sampleDSAProblems, sampleInterviewQuestions, samplePracticeQuestions, sampleProjects } from './data/seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/preptrack_ai';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seeder] Connected to MongoDB. Starting database seed...');

    // 1. Seed or find demo user
    let user = await User.findOne({ email: 'charan@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Charan',
        email: 'charan@example.com',
        password: 'password123',
        targetRole: 'Software Development Engineer (SDE)',
        targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Atlassian'],
        placementYear: 2026,
        xp: 2850,
        level: 5,
        streak: {
          currentStreak: 12,
          longestStreak: 18,
          lastActiveDate: new Date().toISOString().split('T')[0]
        },
        studyStats: {
          totalMinutes: 205, // 3h 25m
          topicsCompletedCount: 128,
          dsaSolvedCount: 54,
          aptitudeSolvedCount: 85,
          interviewQuestionsPracticed: 42
        },
        badges: [
          { badgeId: 'first_step', name: 'First Step', icon: 'Footprints', description: 'Completed your first topic!' },
          { badgeId: '7_day_warrior', name: '7 Day Warrior', icon: 'Flame', description: 'Maintained a 7-day study streak!' },
          { badgeId: 'dsa_beginner', name: 'DSA Beginner', icon: 'Code', description: 'Solved 25+ DSA algorithmic problems' }
        ]
      });
      console.log('[Seeder] Created default user: charan@example.com (password123)');
    }

    // 2. Check if subjects are already seeded
    const existingSubjectCount = await Subject.countDocuments();
    if (existingSubjectCount < syllabusData.length) {
      console.log(`[Seeder] Seeding full syllabus (${syllabusData.length} subjects & 500+ topics)...`);

      for (let i = 0; i < syllabusData.length; i++) {
        const subData = syllabusData[i];
        let subject = await Subject.findOne({ slug: subData.slug });
        if (!subject) {
          subject = await Subject.create({
            name: subData.name,
            slug: subData.slug,
            category: subData.category,
            description: subData.description,
            icon: subData.icon,
            color: subData.color,
            order: i,
            totalTopicsCount: subData.topics.length
          });
        }

        // Seed topics for this subject
        for (let j = 0; j < subData.topics.length; j++) {
          const topicTitle = subData.topics[j];
          const topicSlug = `${subData.slug}-${topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          let topic = await Topic.findOne({ slug: topicSlug });
          if (!topic) {
            const checklists = generateTopicChecklists(topicTitle, subData.name);
            topic = await Topic.create({
              subjectId: subject._id,
              subjectName: subject.name,
              name: topicTitle,
              slug: topicSlug,
              description: `Master ${topicTitle} principles, edge-cases, and interview patterns in ${subject.name}.`,
              importance: j < 5 ? 'Core' : 'High',
              difficulty: j % 3 === 0 ? 'Easy' : (j % 3 === 1 ? 'Medium' : 'Hard'),
              order: j,
              subtopics: [`Fundamentals of ${topicTitle}`, `Best Practices & Patterns`, `Complex Problem Scenarios`],
              theoryItems: checklists.theoryItems,
              assessmentItems: checklists.assessmentItems,
              practicalItems: checklists.practicalItems,
              interviewItems: checklists.interviewItems,
              resources: checklists.resources
            });
          }
        }
      }
      console.log('[Seeder] Full syllabus successfully seeded!');
    } else {
      console.log(`[Seeder] All ${existingSubjectCount} subjects already present.`);
    }

    // 3. Seed sample DSA Problems for user if none exist
    const userDSACount = await DSAProblem.countDocuments({ userId: user._id });
    if (userDSACount === 0) {
      for (const dsa of sampleDSAProblems) {
        await DSAProblem.create({
          ...dsa,
          userId: user._id
        });
      }
      console.log('[Seeder] Seeded sample DSA problems.');
    }

    // 4. Seed sample Interview Questions if empty
    const interviewCount = await InterviewQuestion.countDocuments();
    if (interviewCount === 0) {
      for (const q of sampleInterviewQuestions) {
        await InterviewQuestion.create(q);
      }
      console.log('[Seeder] Seeded sample interview questions.');
    }

    // 5. Seed sample Practice Questions if empty
    const practiceCount = await PracticeQuestion.countDocuments();
    if (practiceCount === 0) {
      for (const pq of samplePracticeQuestions) {
        await PracticeQuestion.create(pq);
      }
      console.log('[Seeder] Seeded sample practice questions.');
    }

    // 6. Seed sample Projects for user if none exist
    const projectCount = await Project.countDocuments({ userId: user._id });
    if (projectCount === 0) {
      for (const proj of sampleProjects) {
        await Project.create({
          ...proj,
          userId: user._id
        });
      }
      console.log('[Seeder] Seeded sample projects.');
    }

    // 7. Seed sample Daily Tasks for today if none exist
    const today = new Date().toISOString().split('T')[0];
    const taskCount = await DailyTask.countDocuments({ userId: user._id, date: today });
    if (taskCount === 0) {
      await DailyTask.create([
        {
          userId: user._id,
          date: today,
          subject: 'DBMS and SQL',
          topic: 'Normalization',
          subtopic: '3NF and BCNF Functional Dependencies',
          timeSlot: 'Morning',
          estimatedDuration: 45,
          actualDuration: 45,
          difficulty: 'Medium',
          status: 'Completed',
          isCompleted: true,
          notes: 'Covered Armstrong Axioms and Lossless Decomposition'
        },
        {
          userId: user._id,
          date: today,
          subject: 'Python Programming',
          topic: 'Dictionaries',
          subtopic: 'Dictionary Comprehension & Methods',
          timeSlot: 'Afternoon',
          estimatedDuration: 30,
          actualDuration: 30,
          difficulty: 'Easy',
          status: 'Completed',
          isCompleted: true,
          notes: 'Built frequency counter'
        },
        {
          userId: user._id,
          date: today,
          subject: 'Data Structures and Algorithms',
          topic: 'Sliding Window',
          subtopic: 'Longest Substring Without Repeating Characters',
          timeSlot: 'Afternoon',
          estimatedDuration: 60,
          actualDuration: 40,
          difficulty: 'Hard',
          status: 'In Progress',
          isCompleted: false,
          notes: 'Solved on LeetCode; review edge case with duplicates'
        },
        {
          userId: user._id,
          date: today,
          subject: 'Quantitative Aptitude',
          topic: 'Probability',
          subtopic: 'Conditional Probability & Bayes Theorem',
          timeSlot: 'Evening',
          estimatedDuration: 30,
          difficulty: 'Medium',
          status: 'Not Started',
          isCompleted: false
        },
        {
          userId: user._id,
          date: today,
          subject: 'Computer Networks',
          topic: 'TCP Handshake',
          subtopic: 'TCP vs UDP Headers and Handshake Flow',
          timeSlot: 'Night',
          estimatedDuration: 30,
          difficulty: 'Medium',
          status: 'Not Started',
          isCompleted: false
        }
      ]);
      console.log('[Seeder] Seeded today\'s sample daily tasks.');
    }

    // 8. Seed sample Revisions for today
    const revCount = await Revision.countDocuments({ userId: user._id, scheduledDate: today });
    if (revCount === 0) {
      await Revision.create([
        {
          userId: user._id,
          subjectName: 'Operating Systems',
          topicName: 'Deadlocks',
          revisionStage: 2,
          scheduledDate: today,
          status: 'Pending',
          notes: 'Review Coffman conditions and Banker\'s algorithm.'
        },
        {
          userId: user._id,
          subjectName: 'DBMS and SQL',
          topicName: 'Joins',
          revisionStage: 3,
          scheduledDate: today,
          status: 'Pending',
          notes: 'Practice self-join and full outer join syntax.'
        },
        {
          userId: user._id,
          subjectName: 'AI and Machine Learning',
          topicName: 'Overfitting',
          revisionStage: 1,
          scheduledDate: today,
          status: 'Pending',
          notes: 'L1/L2 regularization and dropout mechanisms.'
        }
      ]);
      console.log('[Seeder] Seeded today\'s spaced revisions.');
    }

    // 9. Seed sample Mistakes
    const mistakeCount = await Mistake.countDocuments({ userId: user._id });
    if (mistakeCount === 0) {
      await Mistake.create([
        {
          userId: user._id,
          question: 'In TCP 3-way handshake, what flags are set in the second packet?',
          myAnswer: 'ACK only',
          correctAnswer: 'SYN and ACK both',
          whyWrong: 'Forgot that the server must simultaneously acknowledge the client SYN and transmit its own initial sequence number.',
          subject: 'Computer Networks',
          topic: 'TCP Handshake',
          difficulty: 'Medium',
          resolved: false
        },
        {
          userId: user._id,
          question: 'What is the worst-case time complexity of Quick Sort when naive pivot selection is used on already sorted input?',
          myAnswer: 'O(N log N)',
          correctAnswer: 'O(N^2)',
          whyWrong: 'Unbalanced partitions divide the problem into sizes 0 and N - 1 at each recursive level.',
          subject: 'Data Structures and Algorithms',
          topic: 'Quick Sort',
          difficulty: 'Easy',
          resolved: false
        }
      ]);
      console.log('[Seeder] Seeded sample mistakes in Mistake Book.');
    }

    // 10. Seed sample Goals
    const goalCount = await Goal.countDocuments({ userId: user._id });
    if (goalCount === 0) {
      await Goal.create([
        {
          userId: user._id,
          title: 'Complete DBMS in 10 days',
          category: 'Core CSE',
          targetValue: 46,
          currentValue: 32,
          unit: 'topics',
          deadline: '2026-09-16',
          dailyTarget: 4,
          status: 'In Progress'
        },
        {
          userId: user._id,
          title: 'Solve 100 DSA problems this month',
          category: 'DSA',
          targetValue: 100,
          currentValue: 54,
          unit: 'problems',
          deadline: '2026-09-30',
          dailyTarget: 3,
          status: 'In Progress'
        },
        {
          userId: user._id,
          title: 'Study Python for 30 consecutive days',
          category: 'Study Time',
          targetValue: 30,
          currentValue: 12,
          unit: 'days',
          deadline: '2026-09-24',
          dailyTarget: 1,
          status: 'In Progress'
        }
      ]);
      console.log('[Seeder] Seeded sample goals.');
    }

    console.log('[Seeder] Database initialization complete!');
  } catch (err) {
    console.error('[Seeder Error]:', err.message);
  }
};

// If run directly: node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('[Seeder] Finished. Exiting process.');
    process.exit(0);
  });
}
