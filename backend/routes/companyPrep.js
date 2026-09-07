import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import CompanyPrep from '../models/CompanyPrep.js';

const router = express.Router();

const seedDefaultCompanies = async () => {
  const count = await CompanyPrep.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        name: 'Google',
        slug: 'google',
        tier: 'Product / FAANG',
        dsaDifficulty: 'Hard',
        aptitudeImportance: 'Low / Not Tested',
        frequentlyTestedSubjects: ['Algorithms & Data Structures', 'System Design', 'Operating Systems Concurrency'],
        technicalFocusTopics: ['Dynamic Programming', 'Graph Theory & Topological Sort', 'Trie & Segment Trees', 'Distributed Architecture'],
        hrBehavioralFocus: ['Googliness', 'Navigating Ambiguity', 'Bias for Action', 'Collaboration Across Timezones'],
        interviewRounds: [
          { roundNumber: 1, name: 'Online Coding Assessment', duration: '90 mins', description: '2 complex algorithmic challenges on Google assessment platform.' },
          { roundNumber: 2, name: 'Technical Phone Screen', duration: '45 mins', description: 'Live coding on Google Docs / coderpad with senior Google engineer.' },
          { roundNumber: 3, name: 'Onsite / Virtual Round 1 (DSA)', duration: '45 mins', description: 'Advanced graph/tree data structures with optimal time & space proofs.' },
          { roundNumber: 4, name: 'Onsite / Virtual Round 2 (DSA)', duration: '45 mins', description: 'Dynamic programming, sliding window, and complex state representations.' },
          { roundNumber: 5, name: 'Googliness & Leadership', duration: '45 mins', description: 'Hypothetical behavioral scenarios demonstrating ethical engineering and leadership.' }
        ],
        preparationChecklist: [
          { task: 'Solve 50 LeetCode Medium/Hard DP & Graph problems', category: 'DSA', estimatedHours: 30 },
          { task: 'Master time/space complexity proofs for non-trivial recursive functions', category: 'Theory', estimatedHours: 10 },
          { task: 'Prepare 5 STAR stories demonstrating Googliness and ownership', category: 'HR', estimatedHours: 6 },
          { task: 'Take Google-specific Mock Technical Interview', category: 'Practice', estimatedHours: 2 }
        ]
      },
      {
        name: 'Microsoft',
        slug: 'microsoft',
        tier: 'Product / FAANG',
        dsaDifficulty: 'Medium to Hard',
        aptitudeImportance: 'Low / Not Tested',
        frequentlyTestedSubjects: ['Data Structures and Algorithms', 'System Architecture', 'OOP & Design Patterns'],
        technicalFocusTopics: ['Trees & Binary Search Trees', 'Linked Lists & Pointers', 'Recursion & Backtracking', 'Low Level Design'],
        hrBehavioralFocus: ['Growth Mindset', 'Handling Constructive Criticism', 'Passion for Technology'],
        interviewRounds: [
          { roundNumber: 1, name: 'Codility OA', duration: '90 mins', description: '3 coding problems with automated unit testing suites.' },
          { roundNumber: 2, name: 'Technical Round 1', duration: '60 mins', description: 'DSA, code cleanliness, boundary condition handling.' },
          { roundNumber: 3, name: 'Technical Round 2', duration: '60 mins', description: 'System design / OOP design pattern and real-world microservice flow.' },
          { roundNumber: 4, name: 'AA (As-Appropriate) Director Round', duration: '45 mins', description: 'Cultural fit, architectural philosophy, and technical depth.' }
        ],
        preparationChecklist: [
          { task: 'Master Binary Trees, Traversals, and Lowest Common Ancestor', category: 'DSA', estimatedHours: 15 },
          { task: 'Review OOP Solid Principles & Design Patterns (Singleton, Factory, Strategy)', category: 'Design', estimatedHours: 8 },
          { task: 'Prepare examples of demonstrating a Growth Mindset in past projects', category: 'HR', estimatedHours: 4 }
        ]
      },
      {
        name: 'Amazon',
        slug: 'amazon',
        tier: 'Product / FAANG',
        dsaDifficulty: 'Medium to Hard',
        aptitudeImportance: 'Moderate',
        frequentlyTestedSubjects: ['DSA', 'OOP and Low Level Design', '16 Leadership Principles (LPs)'],
        technicalFocusTopics: ['Heaps & Priority Queues', 'BFS/DFS Grid Traversals', 'Hash Maps', 'LRU Cache Design'],
        hrBehavioralFocus: ['Customer Obsession', 'Deliver Results', 'Ownership', 'Deep Dive', 'Invent and Simplify'],
        interviewRounds: [
          { roundNumber: 1, name: 'Amazon Online Assessment (OA)', duration: '90 mins', description: '2 coding problems + Work Simulation Assessment.' },
          { roundNumber: 2, name: 'Technical + LP Round 1', duration: '60 mins', description: 'DSA problem solving + 2 Leadership Principle deep dives.' },
          { roundNumber: 3, name: 'Technical + LP Round 2', duration: '60 mins', description: 'System architecture / object modeling + LP questions.' },
          { roundNumber: 4, name: 'Bar Raiser Round', duration: '60 mins', description: 'Independent cross-functional evaluation assessing cultural excellence.' }
        ],
        preparationChecklist: [
          { task: 'Prepare 2 concrete STAR stories for each of Amazon\'s 16 Leadership Principles', category: 'HR', estimatedHours: 12 },
          { task: 'Implement LRU Cache, Design Twitter, and Parking Lot low-level design', category: 'Design', estimatedHours: 10 },
          { task: 'Solve top 30 Amazon tagged problems on LeetCode', category: 'DSA', estimatedHours: 20 }
        ]
      },
      {
        name: 'TCS (Digital & Prime)',
        slug: 'tcs',
        tier: 'Service / Mass IT',
        dsaDifficulty: 'Medium',
        aptitudeImportance: 'Critical (Elimination)',
        frequentlyTestedSubjects: ['Quantitative Aptitude', 'Reasoning Ability', 'Verbal Ability', 'DSA & SQL'],
        technicalFocusTopics: ['Percentages & Profit Loss', 'Permutations & Probability', 'Arrays & Strings', 'Basic SQL Joins & Queries'],
        hrBehavioralFocus: ['Willingness to Relocate', 'Flexibility on Shifts', 'Teamwork & Academic Projects'],
        interviewRounds: [
          { roundNumber: 1, name: 'TCS NQT Online Exam', duration: '120 mins', description: 'Cognitive Aptitude + Advanced Coding Section.' },
          { roundNumber: 2, name: 'Technical Interview', duration: '30 mins', description: 'Core CS fundamentals (DBMS, OS, OOP) and project review.' },
          { roundNumber: 3, name: 'Managerial & HR Round', duration: '20 mins', description: 'Behavioral verification and company alignment.' }
        ],
        preparationChecklist: [
          { task: 'Complete 10 sectional Aptitude and Reasoning diagnostic tests', category: 'Aptitude', estimatedHours: 15 },
          { task: 'Revise 50 core DBMS, OS, and CN placement interview questions', category: 'Core CS', estimatedHours: 10 },
          { task: 'Be ready to explain final-year academic project architecture', category: 'Projects', estimatedHours: 5 }
        ]
      },
      {
        name: 'Infosys',
        slug: 'infosys',
        tier: 'Service / Mass IT',
        dsaDifficulty: 'Easy to Medium',
        aptitudeImportance: 'Critical (Elimination)',
        frequentlyTestedSubjects: ['Logical Reasoning', 'Quantitative Ability', 'Verbal English', 'Core Java/Python'],
        technicalFocusTopics: ['Puzzles & Seating Arrangements', 'Data Interpretation', 'Strings and Arrays', 'OOP Concepts'],
        hrBehavioralFocus: ['Communication Clarity', 'Adaptability', 'Company Values'],
        interviewRounds: [
          { roundNumber: 1, name: 'Infosys Online Test', duration: '100 mins', description: 'Reasoning, Mathematical ability, Verbal, and Pseudocode.' },
          { roundNumber: 2, name: 'Technical + HR Interview', duration: '30 mins', description: 'Basic coding, resume review, and behavioral questions.' }
        ],
        preparationChecklist: [
          { task: 'Solve 20 floor puzzles and linear seating arrangement exercises', category: 'Reasoning', estimatedHours: 8 },
          { task: 'Revise Java/Python OOP pillars (Polymorphism, Inheritance, Encapsulation)', category: 'Core CS', estimatedHours: 6 }
        ]
      }
    ];

    await CompanyPrep.insertMany(defaults);
  }
};

seedDefaultCompanies().catch(console.error);

// GET /api/company-prep
router.get('/', protect, async (req, res) => {
  try {
    const companies = await CompanyPrep.find().sort({ name: 1 });
    const formatted = companies.map(c => {
      const userProgress = c.userChecklistProgress.find(p => p.userId.toString() === req.user._id.toString());
      const completedCount = userProgress?.completedTaskIndexes?.length || 0;
      const totalTasks = c.preparationChecklist?.length || 1;
      return {
        ...c.toObject(),
        checklistCompletedCount: completedCount,
        checklistTotalCount: totalTasks,
        completionPercentage: Math.round((completedCount / totalTasks) * 100)
      };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/company-prep/:slug
router.get('/:slug', protect, async (req, res) => {
  try {
    const company = await CompanyPrep.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const userProgress = company.userChecklistProgress.find(p => p.userId.toString() === req.user._id.toString());
    const completedIndexes = userProgress?.completedTaskIndexes || [];

    res.json({
      ...company.toObject(),
      completedTaskIndexes: completedIndexes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/company-prep/:slug/toggle-task
router.post('/:slug/toggle-task', protect, async (req, res) => {
  try {
    const { taskIndex } = req.body;
    const company = await CompanyPrep.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    let userProgress = company.userChecklistProgress.find(p => p.userId.toString() === req.user._id.toString());
    if (!userProgress) {
      company.userChecklistProgress.push({
        userId: req.user._id,
        completedTaskIndexes: [taskIndex]
      });
    } else {
      const exists = userProgress.completedTaskIndexes.includes(taskIndex);
      if (exists) {
        userProgress.completedTaskIndexes = userProgress.completedTaskIndexes.filter(i => i !== taskIndex);
      } else {
        userProgress.completedTaskIndexes.push(taskIndex);
      }
    }

    await company.save();
    const updated = company.userChecklistProgress.find(p => p.userId.toString() === req.user._id.toString());
    res.json({ completedTaskIndexes: updated?.completedTaskIndexes || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
