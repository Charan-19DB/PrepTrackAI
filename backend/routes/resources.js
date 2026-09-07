import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import LearningResource from '../models/LearningResource.js';
import { detectWeakTopics } from '../services/weakTopicDetector.js';
import { teachConceptAgain } from '../services/aiService.js';

const router = express.Router();

/**
 * Curated Top Educational YouTube Channels Directory (11 Categories from Specification)
 * Verified channels, handles, and recommended topics.
 */
export const YOUTUBE_CHANNELS = [
  // 1. Programming
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp.org',
    handle: '@freecodecamp',
    url: 'https://www.youtube.com/@freecodecamp',
    category: 'Programming',
    subscribers: '10.2M',
    description: 'Comprehensive full-length courses on Python, JavaScript, C++, Go, and Rust without interruptions.',
    topPlaylists: ['Python Full Course for Beginners', 'C++ Programming Course', 'JavaScript Algorithms'],
    authorityBadge: 'Gold Standard',
    language: 'English'
  },
  {
    id: 'chaiaurcode',
    name: 'Chai aur Code',
    handle: '@chaiaurcode',
    url: 'https://www.youtube.com/@chaiaurcode',
    category: 'Programming',
    subscribers: '1.4M',
    description: 'High-clarity, project-based engineering tutorials in Hindi/Hinglish covering JavaScript, React, and Backend.',
    topPlaylists: ['JavaScript Full Series', 'React Mastery', 'Python for Coders'],
    authorityBadge: 'Top Placement Favorite',
    language: 'Hindi/English'
  },
  {
    id: 'brocode',
    name: 'Bro Code',
    handle: '@BroCodez',
    url: 'https://www.youtube.com/@BroCodez',
    category: 'Programming',
    subscribers: '2.5M',
    description: 'Fast-paced, highly visual programming fundamentals for C, C++, Java, and Python.',
    topPlaylists: ['C Full Course', 'Java Full Course', 'Python Mastery in 12 Hours'],
    authorityBadge: 'Quick Learner',
    language: 'English'
  },

  // 2. Data Structures & Algorithms (DSA)
  {
    id: 'takeuforward',
    name: 'take U forward (Striver)',
    handle: '@takeUforward',
    url: 'https://www.youtube.com/@takeUforward',
    category: 'DSA',
    subscribers: '1.2M',
    description: 'The industry-standard SDE Sheet and A2Z DSA Course with rigorous intuition, brute-better-optimal breakdowns.',
    topPlaylists: ['Striver A2Z DSA Course', 'Dynamic Programming Series', 'Graph Series from Scratch'],
    authorityBadge: 'Must-Watch for FAANG',
    language: 'English/Hinglish'
  },
  {
    id: 'abdulbari',
    name: 'Abdul Bari',
    handle: '@AbdulBari',
    url: 'https://www.youtube.com/@AbdulBari',
    category: 'DSA',
    subscribers: '1.1M',
    description: 'Legendary visual chalkboard explanations of algorithm design, divide and conquer, dynamic programming, and greedy.',
    topPlaylists: ['Algorithms Masterclass', 'Dynamic Programming Fundamentals', 'Graph Algorithms'],
    authorityBadge: 'Legendary Professor',
    language: 'English'
  },
  {
    id: 'neetcode',
    name: 'NeetCode',
    handle: '@NeetCode',
    url: 'https://www.youtube.com/@NeetCode',
    category: 'DSA',
    subscribers: '850K',
    description: 'Concise LeetCode 150/75 visual pattern walkthroughs by an ex-Google Software Engineer.',
    topPlaylists: ['NeetCode 150 Solutions', 'Sliding Window Patterns', 'Binary Trees & Graphs'],
    authorityBadge: 'Top LeetCode Guide',
    language: 'English'
  },
  {
    id: 'kunalkushwaha',
    name: 'Kunal Kushwaha',
    handle: '@KunalKushwaha',
    url: 'https://www.youtube.com/@KunalKushwaha',
    category: 'DSA',
    subscribers: '820K',
    description: 'Comprehensive free DSA in Java bootcamp with live coding, recursion trees, and open-source guidance.',
    topPlaylists: ['Complete Java DSA Playlist', 'Recursion & Backtracking', 'Git & GitHub Bootcamp'],
    authorityBadge: 'Community Champion',
    language: 'English'
  },

  // 3. DBMS and SQL
  {
    id: 'gatesmashers_dbms',
    name: 'Gate Smashers (Varun Singla)',
    handle: '@GateSmashers',
    url: 'https://www.youtube.com/@GateSmashers',
    category: 'DBMS',
    subscribers: '1.9M',
    description: 'The most popular DBMS lectures covering Normalization (1NF to BCNF), ER Diagrams, SQL Queries, and Transactions.',
    topPlaylists: ['DBMS Complete Course for Placements & GATE', 'Normalization in 1 Shot', 'ACID Properties & Schedules'],
    authorityBadge: 'Top Placement Favorite',
    language: 'Hindi/English'
  },
  {
    id: 'knowledgegate_dbms',
    name: 'Knowledge Gate (Sanchit Jain)',
    handle: '@KnowledgeGate_SanchitJain',
    url: 'https://www.youtube.com/@KnowledgeGate_SanchitJain',
    category: 'DBMS',
    subscribers: '1.1M',
    description: 'Crisp, structured conceptual deep-dives into relational algebra, indexing, B-Trees, and serializability.',
    topPlaylists: ['DBMS Complete Playlist', 'SQL Placement Questions', 'B+ Trees Demystified'],
    authorityBadge: 'Academic Excellence',
    language: 'Hindi'
  },
  {
    id: 'alextheanalyst',
    name: 'Alex The Analyst',
    handle: '@AlexTheAnalyst',
    url: 'https://www.youtube.com/@AlexTheAnalyst',
    category: 'DBMS',
    subscribers: '950K',
    description: 'Practical, real-world SQL queries, window functions, joins, subqueries, and database performance walkthroughs.',
    topPlaylists: ['SQL Full Course for Beginners', 'Intermediate SQL Mastery', 'Portfolio Project in SQL'],
    authorityBadge: 'Practical SQL',
    language: 'English'
  },

  // 4. Operating Systems
  {
    id: 'gatesmashers_os',
    name: 'Gate Smashers — OS',
    handle: '@GateSmashers',
    url: 'https://www.youtube.com/@GateSmashers',
    category: 'OS',
    subscribers: '1.9M',
    description: 'Unrivaled explanations of Deadlocks, CPU Scheduling algorithms, Banker\'s Algorithm, and Virtual Memory.',
    topPlaylists: ['Operating Systems Complete Series', 'Deadlocks in Operating Systems', 'Paging and Segmentation'],
    authorityBadge: 'Placement Essential',
    language: 'Hindi/English'
  },
  {
    id: 'nesoacademy_os',
    name: 'Neso Academy — OS',
    handle: '@nesoacademy',
    url: 'https://www.youtube.com/@nesoacademy',
    category: 'OS',
    subscribers: '2.7M',
    description: 'Polished digital blackboard lectures on Process Management, Threads, Synchronization, and Semaphores in pure English.',
    topPlaylists: ['Operating Systems Playlist', 'Process Synchronization & Semaphores', 'Memory Management Unit'],
    authorityBadge: 'Global University Quality',
    language: 'English'
  },

  // 5. Computer Networks
  {
    id: 'networkchuck',
    name: 'NetworkChuck',
    handle: '@NetworkChuck',
    url: 'https://www.youtube.com/@NetworkChuck',
    category: 'CN',
    subscribers: '4.2M',
    description: 'High-energy, real-packet capture demonstrations of TCP 3-way handshakes, Subnetting, DNS, Routers, and Firewalls with Wireshark.',
    topPlaylists: ['You need to learn Networking RIGHT NOW', 'Subnetting is SIMPLE', 'How the Internet Works'],
    authorityBadge: 'Most Engaging',
    language: 'English'
  },
  {
    id: 'powercert',
    name: 'PowerCert Animated Videos',
    handle: '@PowerCertAnimatedVideos',
    url: 'https://www.youtube.com/@PowerCertAnimatedVideos',
    category: 'CN',
    subscribers: '2.4M',
    description: 'Crystal-clear 3D animated explanations of OSI 7 layers, TCP vs UDP, IP addressing, and packet routing.',
    topPlaylists: ['Computer Networking Animated', 'TCP/IP vs OSI Model', 'Switches vs Routers vs Hubs'],
    authorityBadge: 'Best Animations',
    language: 'English'
  },

  // 6. Quantitative & Logical Aptitude
  {
    id: 'careerride',
    name: 'CareerRide',
    handle: '@CareerRide',
    url: 'https://www.youtube.com/@CareerRide',
    category: 'Aptitude',
    subscribers: '1.8M',
    description: 'Speed math shortcuts and conceptual drills for TCS NQT, Infosys, Cognizant, and Wipro placement tests.',
    topPlaylists: ['Quantitative Aptitude Made Easy', 'Time and Work Shortcuts', 'Permutation and Combination Tricks'],
    authorityBadge: 'Campus Drive Favorite',
    language: 'English/Hindi'
  },
  {
    id: 'feelfreetolearn',
    name: 'Feel Free to Learn',
    handle: '@FeelFreetoLearn',
    url: 'https://www.youtube.com/@FeelFreetoLearn',
    category: 'Aptitude',
    subscribers: '1.2M',
    description: 'Detailed step-by-step reasoning tricks, syllogisms, blood relations, and coding-decoding solutions in English.',
    topPlaylists: ['Reasoning Shortcuts for Beginners', 'Profit and Loss Masterclass', 'Data Interpretation Tricks'],
    authorityBadge: 'High Clarity',
    language: 'English'
  },

  // 7. English & Communication
  {
    id: 'learnenglishwithemma',
    name: 'Learn English with Emma [engVid]',
    handle: '@LearnEnglishwithEmma',
    url: 'https://www.youtube.com/@LearnEnglishwithEmma',
    category: 'English',
    subscribers: '5.6M',
    description: 'Master grammar, eliminate filler words, boost pronunciation, and craft professional English communication.',
    topPlaylists: ['Grammar Essentials for Professionals', 'Stop Saying UM: Fluency Hacks', 'Job Interview English Tips'],
    authorityBadge: 'Fluency Leader',
    language: 'English'
  },
  {
    id: 'oxfordonlineenglish',
    name: 'Oxford Online English',
    handle: '@Oxfordonlineenglish',
    url: 'https://www.youtube.com/@Oxfordonlineenglish',
    category: 'English',
    subscribers: '3.1M',
    description: 'Structured corporate communication, business email writing, and technical presentation skills.',
    topPlaylists: ['How to Talk About Yourself in an Interview', 'Sound Professional in English', 'Writing Clear Emails'],
    authorityBadge: 'Corporate Ready',
    language: 'English'
  },

  // 8. Artificial Intelligence & Machine Learning
  {
    id: '3blue1brown',
    name: '3Blue1Brown (Grant Sanderson)',
    handle: '@3blue1brown',
    url: 'https://www.youtube.com/@3blue1brown',
    category: 'AI/ML',
    subscribers: '6.4M',
    description: 'Unmatched visual geometry of Neural Networks, Backpropagation, Linear Algebra, and Transformers.',
    topPlaylists: ['Neural Networks Explained Visually', 'Essence of Linear Algebra', 'Essence of Calculus'],
    authorityBadge: 'Visual Genius',
    language: 'English'
  },
  {
    id: 'statquest',
    name: 'StatQuest with Josh Starmer',
    handle: '@statquest',
    url: 'https://www.youtube.com/@statquest',
    category: 'AI/ML',
    subscribers: '1.3M',
    description: 'Bite-sized, zero-intimidation breakdowns of Gradient Descent, Decision Trees, SVMs, PCA, and LLMs. BAM!',
    topPlaylists: ['Machine Learning Fundamentals', 'Neural Networks from Scratch', 'Statistics Masterclass'],
    authorityBadge: 'BAM! Essential',
    language: 'English'
  },
  {
    id: 'deeplearningai',
    name: 'DeepLearning.AI (Andrew Ng)',
    handle: '@Deeplearningai',
    url: 'https://www.youtube.com/@Deeplearningai',
    category: 'AI/ML',
    subscribers: '1.2M',
    description: 'The premier AI engineering education platform founded by Prof. Andrew Ng with short courses on Generative AI and LLMs.',
    topPlaylists: ['AI for Everyone', 'Generative AI Concepts', 'Deep Learning Specialization'],
    authorityBadge: 'AI Industry Standard',
    language: 'English'
  },

  // 9. System Design
  {
    id: 'bytebytego',
    name: 'ByteByteGo (Alex Xu)',
    handle: '@ByteByteGo',
    url: 'https://www.youtube.com/@ByteByteGo',
    category: 'System Design',
    subscribers: '1.3M',
    description: 'Animated architectural breakdowns of URL Shorteners, WhatsApp, Rate Limiters, Distributed Caches, and Message Queues.',
    topPlaylists: ['System Design Interview Fundamentals', 'How Top Tech Scales', 'Architecture Deep Dives'],
    authorityBadge: 'Gold Standard for SDE-2',
    language: 'English'
  },
  {
    id: 'gauravsen',
    name: 'Gaurav Sen',
    handle: '@gkcs',
    url: 'https://www.youtube.com/@gkcs',
    category: 'System Design',
    subscribers: '510K',
    description: 'Intuitive whiteboarding of Distributed Systems, CAP Theorem, Consistent Hashing, and Microservices.',
    topPlaylists: ['System Design Fundamentals', 'High Level Design Case Studies', 'Distributed Systems Basics'],
    authorityBadge: 'Pioneer of Design Whiteboarding',
    language: 'English'
  },

  // 10. Web Development
  {
    id: 'webdevsimplified',
    name: 'Web Dev Simplified',
    handle: '@WebDevSimplified',
    url: 'https://www.youtube.com/@WebDevSimplified',
    category: 'Web Development',
    subscribers: '1.6M',
    description: 'Straight-to-the-point tutorials on React hooks, async JavaScript, CSS Grid/Flexbox, and clean full-stack architecture.',
    topPlaylists: ['React Hooks Explained', 'JavaScript Mastery', 'Full Stack MERN Projects'],
    authorityBadge: 'Clean Code',
    language: 'English'
  },
  {
    id: 'traversymedia',
    name: 'Traversy Media (Brad Traversy)',
    handle: '@TraversyMedia',
    url: 'https://www.youtube.com/@TraversyMedia',
    category: 'Web Development',
    subscribers: '2.2M',
    description: 'Pragmatic crash courses on Node.js, Express, MongoDB, REST APIs, and modern frontend frameworks.',
    topPlaylists: ['Node.js & Express from Scratch', 'MERN Stack Front To Back', 'Modern JavaScript from Beginning'],
    authorityBadge: 'Full Stack Classic',
    language: 'English'
  },

  // 11. Cloud & DevOps
  {
    id: 'techworldwithnana',
    name: 'TechWorld with Nana',
    handle: '@TechWorldwithNana',
    url: 'https://www.youtube.com/@TechWorldwithNana',
    category: 'Cloud/DevOps',
    subscribers: '1.1M',
    description: 'Clear, beginner-friendly explanations of Docker, Kubernetes, CI/CD pipelines, Terraform, and AWS Cloud.',
    topPlaylists: ['Docker for Beginners', 'Kubernetes Tutorial for Beginners', 'DevOps Roadmap from Zero'],
    authorityBadge: 'DevOps Leader',
    language: 'English'
  },
  {
    id: 'abhishekveeramalla',
    name: 'Abhishek Veeramalla',
    handle: '@AbhishekVeeramalla',
    url: 'https://www.youtube.com/@AbhishekVeeramalla',
    category: 'Cloud/DevOps',
    subscribers: '520K',
    description: 'Zero-to-Hero real-time cloud and DevOps engineering projects with interview preparation.',
    topPlaylists: ['DevOps Zero to Hero Playlist', 'AWS Cloud Bootcamp', 'Kubernetes Real-World Scenarios'],
    authorityBadge: 'Hands-On Projects',
    language: 'English/Hindi'
  }
];

/**
 * Curated Authoritative Web Documentation & Practice Hubs
 */
export const WEB_DOCS_DIRECTORY = [
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    subject: 'Web Development & JavaScript',
    type: 'Documentation',
    description: 'The authoritative, definitive documentation on JavaScript, DOM, CSS, and Web APIs maintained by Mozilla and open web contributors.',
    rating: 5.0,
    tags: ['JavaScript', 'Web APIs', 'Frontend', 'Standard']
  },
  {
    title: 'GeeksforGeeks CS Portal',
    url: 'https://www.geeksforgeeks.org',
    subject: 'Computer Science Fundamentals',
    type: 'Article',
    description: 'Comprehensive articles with diagrams and code implementations for OS, DBMS, Computer Networks, and System Design.',
    rating: 4.8,
    tags: ['Operating Systems', 'DBMS', 'CN', 'DSA', 'Interview Prep']
  },
  {
    title: 'Refactoring Guru — Design Patterns',
    url: 'https://refactoring.guru/design-patterns',
    subject: 'Object Oriented Programming & System Design',
    type: 'Documentation',
    description: 'Visual guides explaining Factory, Singleton, Observer, Strategy, and SOLID principles with real-world code analogies.',
    rating: 4.9,
    tags: ['Design Patterns', 'OOP', 'Clean Architecture', 'SOLID']
  },
  {
    title: 'LeetCode Discuss & Study Guides',
    url: 'https://leetcode.com/discuss/study-guide',
    subject: 'Data Structures and Algorithms',
    type: 'Practice',
    description: 'Community-curated study guides for algorithmic patterns: Sliding Window, Two Pointers, Monotonic Stack, and Dynamic Programming.',
    rating: 4.9,
    tags: ['Algorithms', 'FAANG Patterns', 'Coding Drills', 'DSA']
  },
  {
    title: 'W3Schools SQL & Relational Tutorials',
    url: 'https://www.w3schools.com/sql/',
    subject: 'DBMS and SQL',
    type: 'Documentation',
    description: 'Interactive browser-executable SQL tutorial covering Joins, Group By, Subqueries, Constraints, and Indexing.',
    rating: 4.7,
    tags: ['SQL', 'Database Queries', 'Interactive', 'Beginner']
  },
  {
    title: 'The System Design Primer (GitHub)',
    url: 'https://github.com/donnemartin/system-design-primer',
    subject: 'System Design',
    type: 'Documentation',
    description: 'An open-source roadmap for scaling systems to millions of users: Load Balancers, Caching, Sharding, and Asynchronous messaging.',
    rating: 5.0,
    tags: ['Scalability', 'Microservices', 'Distributed Systems', 'Open Source']
  },
  {
    title: 'Baeldung on Java & Spring',
    url: 'https://www.baeldung.com',
    subject: 'Java and Backend',
    type: 'Article',
    description: 'Deep technical articles explaining Java Memory Model, Garbage Collection, Multithreading, and Spring Boot architecture.',
    rating: 4.9,
    tags: ['Java', 'JVM Internals', 'Backend', 'Concurrency']
  },
  {
    title: 'Linux Documentation Project & Man Pages',
    url: 'https://man7.org/linux/man-pages/',
    subject: 'Operating Systems',
    type: 'Documentation',
    description: 'Authoritative documentation for Linux kernel system calls (fork, exec, pipe, pthreads, epoll, mutexes).',
    rating: 4.9,
    tags: ['Linux', 'System Calls', 'Kernel', 'OS Core']
  }
];

/**
 * Seed baseline curated resources if collection is sparse
 */
const seedDefaultResources = async () => {
  try {
    const count = await LearningResource.countDocuments();
    if (count < 15) {
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
          source: 'Gate Smashers',
          duration: '22 mins',
          channelOrAuthor: 'Gate Smashers'
        },
        {
          title: 'Virtual Memory, Paging, Page Faults & Inverted Page Tables',
          url: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',
          type: 'Article',
          subject: 'Operating Systems',
          topic: 'Virtual Memory',
          difficulty: 'Intermediate',
          source: 'GeeksforGeeks',
          duration: '18 mins',
          channelOrAuthor: 'OS Systems Group'
        },
        {
          title: 'Paging in Operating Systems with TLB Cache Mechanics',
          url: 'https://www.youtube.com/watch?v=2OOb_U_2pDk',
          type: 'YouTube',
          subject: 'Operating Systems',
          topic: 'Virtual Memory',
          difficulty: 'Intermediate',
          source: 'Gate Smashers',
          duration: '25 mins',
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
          source: 'Gate Smashers',
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
          title: 'SQL Joins Demystified: Inner, Left, Right, Full, and Cross Joins',
          url: 'https://www.w3schools.com/sql/sql_join.asp',
          type: 'Documentation',
          subject: 'DBMS and SQL',
          topic: 'SQL Joins',
          difficulty: 'Beginner',
          source: 'W3Schools',
          duration: '12 mins',
          channelOrAuthor: 'W3Schools'
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
          title: 'Striver A2Z DSA Course — Sliding Window & Two Pointers',
          url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
          type: 'Article',
          subject: 'Data Structures and Algorithms',
          topic: 'Sliding Window',
          difficulty: 'Intermediate',
          source: 'takeUforward',
          duration: '30 mins',
          channelOrAuthor: 'Striver'
        },
        {
          title: 'Dynamic Programming from Novice to Master with Memoization & Tabulation',
          url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
          type: 'YouTube',
          subject: 'Data Structures and Algorithms',
          topic: 'Dynamic Programming',
          difficulty: 'Advanced',
          source: 'freeCodeCamp',
          duration: '5 hours',
          channelOrAuthor: 'Alvin Zablan'
        },
        {
          title: 'TCP 3-Way Handshake and Connection Teardown Mechanics',
          url: 'https://www.youtube.com/watch?v=bW_kWXiqLcw',
          type: 'YouTube',
          subject: 'Computer Networks',
          topic: 'TCP/IP Model',
          difficulty: 'Intermediate',
          source: 'NetworkChuck',
          duration: '18 mins',
          channelOrAuthor: 'NetworkChuck'
        },
        {
          title: 'Subnetting Demystified — Calculate Network, Broadcast & Subnet Mask in 30 Seconds',
          url: 'https://www.youtube.com/watch?v=s_Ntt6eTn94',
          type: 'YouTube',
          subject: 'Computer Networks',
          topic: 'Subnetting',
          difficulty: 'Intermediate',
          source: 'NetworkChuck',
          duration: '16 mins',
          channelOrAuthor: 'NetworkChuck'
        },
        {
          title: 'System Design: How to Design a Scalable URL Shortener (TinyURL)',
          url: 'https://www.youtube.com/watch?v=fMZMm_0ZhK4',
          type: 'YouTube',
          subject: 'System Design',
          topic: 'Scalability & Caching',
          difficulty: 'Intermediate',
          source: 'ByteByteGo',
          duration: '14 mins',
          channelOrAuthor: 'Alex Xu (ByteByteGo)'
        },
        {
          title: 'Quantitative Aptitude — Time, Speed and Distance Tricks for Placements',
          url: 'https://www.youtube.com/watch?v=kY41Z0i7l9s',
          type: 'YouTube',
          subject: 'Quantitative Aptitude',
          topic: 'Time and Distance',
          difficulty: 'Intermediate',
          source: 'CareerRide',
          duration: '24 mins',
          channelOrAuthor: 'CareerRide'
        }
      ];

      for (const item of defaults) {
        const exists = await LearningResource.findOne({ title: item.title });
        if (!exists) {
          await LearningResource.create(item);
        }
      }
    }
  } catch (err) {
    console.error('[Seed Learning Resources]:', err.message);
  }
};

seedDefaultResources().catch(console.error);

/**
 * GET /api/resources/youtube-channels
 * Returns curated top educational YouTube channels by category (11 categories)
 */
router.get('/youtube-channels', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    let list = [...YOUTUBE_CHANNELS];

    if (category && category !== 'All') {
      list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.topPlaylists.some(p => p.toLowerCase().includes(q))
      );
    }

    res.json({
      total: list.length,
      categories: [
        'All',
        'Programming',
        'DSA',
        'DBMS',
        'OS',
        'CN',
        'Aptitude',
        'English',
        'AI/ML',
        'System Design',
        'Web Development',
        'Cloud/DevOps'
      ],
      channels: list
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/resources/web-docs
 * Returns authoritative web documentation hubs and practice portals
 */
router.get('/web-docs', protect, async (req, res) => {
  try {
    const { search } = req.query;
    let list = [...WEB_DOCS_DIRECTORY];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({
      total: list.length,
      docs: list
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/resources/teach-me-again
 * AI-powered concept breakdown, recovery path, and targeted web & YouTube suggestions
 */
router.post('/teach-me-again', protect, async (req, res) => {
  try {
    const { subject, topic, strengthScore } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required for concept breakdown' });
    }

    // 1. Run Gemini Pedagogical Explainer
    const explanation = await teachConceptAgain({
      subject: subject || 'Computer Science',
      topic,
      userStrengthScore: strengthScore || 35,
      apiKey: req.user?.geminiApiKey || process.env.GEMINI_API_KEY
    });

    // 2. Query database for any existing curated resources for this topic
    const localResources = await LearningResource.find({
      $or: [
        { topic: new RegExp(topic, 'i') },
        { subject: new RegExp(subject || '', 'i') }
      ]
    }).limit(6);

    // 3. Find matching YouTube channels for this subject/category
    const matchedCategory = mapSubjectToCategory(subject);
    const relatedChannels = YOUTUBE_CHANNELS.filter(c =>
      c.category.toLowerCase() === matchedCategory.toLowerCase()
    ).slice(0, 3);

    res.json({
      success: true,
      topic,
      subject,
      explanation,
      localResources,
      relatedChannels
    });
  } catch (error) {
    console.error('[Teach Me Again Error]:', error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Helper to map standard CSE subjects to YouTube categories
 */
function mapSubjectToCategory(subject = '') {
  const s = subject.toLowerCase();
  if (s.includes('data structure') || s.includes('dsa') || s.includes('algorithm')) return 'DSA';
  if (s.includes('dbms') || s.includes('database') || s.includes('sql')) return 'DBMS';
  if (s.includes('operating') || s.includes('os') || s.includes('unix') || s.includes('linux')) return 'OS';
  if (s.includes('network') || s.includes('cn')) return 'CN';
  if (s.includes('aptitude') || s.includes('reasoning') || s.includes('quant')) return 'Aptitude';
  if (s.includes('english') || s.includes('communication') || s.includes('verbal')) return 'English';
  if (s.includes('ai') || s.includes('machine learning') || s.includes('data science')) return 'AI/ML';
  if (s.includes('system design') || s.includes('distributed')) return 'System Design';
  if (s.includes('web') || s.includes('react') || s.includes('node') || s.includes('javascript')) return 'Web Development';
  if (s.includes('cloud') || s.includes('devops') || s.includes('docker') || s.includes('aws')) return 'Cloud/DevOps';
  return 'Programming';
}

/**
 * GET /api/resources
 * Returns standard curated resources with filters
 */
router.get('/', protect, async (req, res) => {
  try {
    const { type, subject, savedOnly, completedOnly, search } = req.query;
    const query = {};

    if (type && type !== 'All') query.type = type;
    if (subject && subject !== 'All') query.subject = subject;
    if (savedOnly === 'true') query.savedBy = req.user._id;
    if (completedOnly === 'true') query.completedBy = req.user._id;

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { topic: new RegExp(search, 'i') },
        { channelOrAuthor: new RegExp(search, 'i') },
        { source: new RegExp(search, 'i') }
      ];
    }

    const resources = await LearningResource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/resources/recommended
 * Curated specifically based on user's lowest strength scores
 */
router.get('/recommended', protect, async (req, res) => {
  try {
    const weakTopics = await detectWeakTopics(req.user._id);
    const weakTopicNames = weakTopics.map(w => w.topic);

    let recommended = await LearningResource.find({
      $or: [
        { topic: { $in: weakTopicNames } },
        { subject: { $in: weakTopics.map(w => w.subject) } }
      ]
    }).limit(12);

    if (recommended.length === 0) {
      recommended = await LearningResource.find().limit(8);
    }

    // Also pick top YouTube channels matching the weak subjects
    const weakSubjectCategories = weakTopics.map(w => mapSubjectToCategory(w.subject));
    const recommendedChannels = YOUTUBE_CHANNELS.filter(c =>
      weakSubjectCategories.includes(c.category)
    ).slice(0, 4);

    res.json({
      weakTopics: weakTopics.slice(0, 5),
      resources: recommended,
      recommendedChannels: recommendedChannels.length > 0 ? recommendedChannels : YOUTUBE_CHANNELS.slice(0, 4)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * POST /api/resources/:id/toggle-save
 */
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

/**
 * POST /api/resources/:id/toggle-complete
 */
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
