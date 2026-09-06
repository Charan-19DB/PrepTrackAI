export const sampleDSAProblems = [
  {
    title: 'Two Sum',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy',
    category: 'Arrays',
    attempts: 2,
    timeTakenMinutes: 15,
    solutionUnderstood: true,
    revisitRequired: false,
    solutionNotes: 'Use Hash Map for O(N) time and O(N) space. Storing complementary target values.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    status: 'Mastered'
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium',
    category: 'Sliding Window',
    attempts: 3,
    timeTakenMinutes: 35,
    solutionUnderstood: true,
    revisitRequired: true,
    solutionNotes: 'Variable sliding window with hash map of character last seen indices. Edge case: duplicate outside window.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(min(M, N))',
    status: 'Solved'
  },
  {
    title: 'Reverse Linked List',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'Easy',
    category: 'Linked List',
    attempts: 1,
    timeTakenMinutes: 12,
    solutionUnderstood: true,
    revisitRequired: false,
    solutionNotes: 'Three pointers: prev, curr, next. Handle null head and single node.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    status: 'Mastered'
  },
  {
    title: 'Lowest Common Ancestor of a Binary Tree',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    difficulty: 'Medium',
    category: 'Trees',
    attempts: 2,
    timeTakenMinutes: 28,
    solutionUnderstood: true,
    revisitRequired: true,
    solutionNotes: 'Postorder DFS traversal. If root matches p or q return root. If both left and right return non-null, root is LCA.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
    status: 'Solved'
  },
  {
    title: 'Course Schedule (Cycle Detection in Directed Graph)',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/course-schedule/',
    difficulty: 'Medium',
    category: 'Graphs',
    attempts: 4,
    timeTakenMinutes: 45,
    solutionUnderstood: true,
    revisitRequired: true,
    solutionNotes: 'Kahn\'s BFS topological sort with in-degree array or DFS with 3-state visiting colors.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    status: 'Attempted'
  },
  {
    title: 'Coin Change',
    platform: 'LeetCode',
    url: 'https://leetcode.com/problems/coin-change/',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    attempts: 3,
    timeTakenMinutes: 40,
    solutionUnderstood: true,
    revisitRequired: false,
    solutionNotes: 'Bottom-up DP table dp[i] = min(dp[i], 1 + dp[i - c]). Initialize with amount + 1.',
    timeComplexity: 'O(amount * coins.length)',
    spaceComplexity: 'O(amount)',
    status: 'Solved'
  }
];

export const sampleInterviewQuestions = [
  {
    category: 'DBMS',
    question: 'What is Database Normalization and why is BCNF stricter than 3NF?',
    idealAnswer: 'Normalization is the process of organizing data in a database to reduce data redundancy and eliminate insertion, update, and deletion anomalies. While 3NF requires that for every functional dependency X -> Y, X is a superkey OR Y is a prime attribute, BCNF removes the second relaxation and strictly mandates that X MUST be a superkey for every non-trivial functional dependency.',
    keyPoints: ['Reduces anomalies and redundancy', '3NF allows prime attributes on RHS', 'BCNF strictly requires LHS to be superkey', 'Lossless decomposition'],
    difficulty: 'Medium',
    topic: 'Normalization'
  },
  {
    category: 'OS',
    question: 'Explain Deadlock. What are the 4 necessary conditions for a Deadlock to occur?',
    idealAnswer: 'A deadlock occurs when two or more processes are permanently blocked because each is holding a resource and waiting for another resource held by another process in a circular chain. The 4 Coffman conditions are: 1. Mutual Exclusion (non-shareable resources), 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly taken), 4. Circular Wait.',
    keyPoints: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Banker\'s Algorithm prevention'],
    difficulty: 'Medium',
    topic: 'Deadlocks'
  },
  {
    category: 'Java',
    question: 'How does HashMap work internally in Java 8+?',
    idealAnswer: 'Java HashMap is based on hashing and uses an array of Node buckets (transient Node<K,V>[] table). In Java 8, when a collision occurs and a bucket linked list exceeds TREEIFY_THRESHOLD (8 nodes) and array capacity is at least 64, the linked list is converted into a Red-Black Tree (TreeNode), reducing lookup time from O(N) to O(log N). Key hashCode() is processed through a murmur/spread function to distribute hashes evenly.',
    keyPoints: ['Array of buckets', 'hashCode & equals contract', 'Collision resolution via linked list & Red-Black Tree', 'TREEIFY_THRESHOLD = 8', 'O(1) average lookup'],
    difficulty: 'Hard',
    topic: 'Collections'
  },
  {
    category: 'CN',
    question: 'Explain the 3-Way Handshake in TCP and why 2-way is not enough.',
    idealAnswer: 'The TCP 3-way handshake establishes a reliable full-duplex byte-stream connection: 1. Client sends SYN (seq = x), 2. Server replies with SYN-ACK (seq = y, ack = x + 1), 3. Client sends ACK (ack = y + 1). A 2-way handshake is insufficient because it cannot guard against delayed or duplicate connection requests; the client could terminate or ignore the connection while the server allocates resources indefinitely thinking the connection is alive.',
    keyPoints: ['SYN -> SYN-ACK -> ACK', 'Synchronizes initial sequence numbers (ISN)', 'Prevents old duplicate connection allocations', 'Full duplex verification'],
    difficulty: 'Medium',
    topic: 'TCP Handshake'
  },
  {
    category: 'Python',
    question: 'What is the difference between deepcopy and shallow copy in Python?',
    idealAnswer: 'A shallow copy (copy.copy()) creates a new compound object and inserts references to the objects found in the original. If the original object contains nested mutable collections, changes to nested objects reflect in both. A deep copy (copy.deepcopy()) recursively copies all nested objects by value, producing completely detached copies in memory.',
    keyPoints: ['copy.copy() copies references to nested objects', 'copy.deepcopy() recursively clones all children', 'Behavior on mutable vs immutable types'],
    difficulty: 'Easy',
    topic: 'Variables'
  },
  {
    category: 'GenAI',
    question: 'What is the purpose of the Query, Key, and Value matrices in Transformer Self-Attention?',
    idealAnswer: 'In Self-Attention, each token embedding is linearly projected into Query (Q), Key (K), and Value (V) vectors. The Query represents what a token is looking for, the Key represents what a token offers or contains, and the Value represents the actual contextual information. The attention weight is computed as Softmax(Q * K^T / sqrt(d_k)), which is then multiplied by V to produce the contextualized representation.',
    keyPoints: ['Q = search query, K = feature index, V = content payload', 'Dot product similarity Q * K^T', 'Scaled by sqrt(d_k) to prevent vanishing softmax gradients', 'Contextualized sum of Values'],
    difficulty: 'Hard',
    topic: 'Transformers'
  },
  {
    category: 'HR',
    question: 'Tell me about a challenging technical bug you encountered and how you resolved it.',
    idealAnswer: 'Structure using STAR (Situation, Task, Action, Result): Describe the system context, the exact failing symptom (e.g. race condition or memory leak), your systematic isolation method (logging, debugger, heap profile), the root cause discovered, and the permanent fix along with automated test coverage added.',
    keyPoints: ['STAR format', 'Systematic debugging approach', 'Demonstrates ownership and communication', 'Preventative testing'],
    difficulty: 'Medium',
    topic: 'HR'
  }
];

export const samplePracticeQuestions = [
  {
    subject: 'DBMS and SQL',
    topic: 'Joins',
    type: 'SQL',
    question: 'Which SQL clause returns all rows from the left table and matched rows from the right table, filling nulls if no match exists?',
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'FULL JOIN', 'CROSS JOIN'],
    correctAnswer: 'LEFT OUTER JOIN',
    explanation: 'LEFT OUTER JOIN returns all tuples from the left relation, matching tuples from the right relation, and sets right relation attributes to NULL when no predicate match occurs.',
    difficulty: 'Easy'
  },
  {
    subject: 'Operating Systems',
    topic: 'Deadlocks',
    type: 'MCQ',
    question: 'Which of the following deadlock handling strategies allows the system to enter a deadlocked state and then recovers from it?',
    options: ['Deadlock Prevention', 'Deadlock Avoidance', 'Deadlock Detection and Recovery', 'Mutual Exclusion Enforcement'],
    correctAnswer: 'Deadlock Detection and Recovery',
    explanation: 'Detection and Recovery lets the system run unconstrained, periodically invokes an algorithm to detect resource cycles, and aborts processes or preempts resources to recover.',
    difficulty: 'Medium'
  },
  {
    subject: 'Data Structures and Algorithms',
    topic: 'Binary Search',
    type: 'Output Prediction',
    question: 'What is the maximum number of comparisons needed to search for an element in a sorted array of 1024 elements using Binary Search?',
    options: ['10', '11', '1024', '512'],
    correctAnswer: '11',
    explanation: 'For N = 1024, log2(1024) = 10. The maximum number of comparisons in worst-case binary search is floor(log2(N)) + 1 = 11.',
    difficulty: 'Easy'
  },
  {
    subject: 'Python Programming',
    topic: 'Lists',
    type: 'Output Prediction',
    question: 'What is the output of: print([i * 2 for i in range(5) if i % 2 == 0])?',
    options: ['[0, 4, 8]', '[0, 2, 4]', '[0, 2, 4, 6, 8]', '[2, 4, 6]'],
    correctAnswer: '[0, 4, 8]',
    explanation: 'range(5) gives 0, 1, 2, 3, 4. Even numbers are 0, 2, 4. Multiplying each by 2 yields [0, 4, 8].',
    difficulty: 'Easy'
  },
  {
    subject: 'Quantitative Aptitude',
    topic: 'Percentages',
    type: 'Aptitude',
    question: 'If the price of petrol increases by 25%, by what percentage must a driver reduce petrol consumption to keep their total expenditure constant?',
    options: ['20%', '25%', '15%', '16.67%'],
    correctAnswer: '20%',
    explanation: 'Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = 1/5 * 100 = 20%.',
    difficulty: 'Medium'
  }
];

export const sampleProjects = [
  {
    title: 'SmartAid — Intelligent Emergency Dispatch System',
    description: 'A full-stack emergency incident response management platform with automated triage routing, live GPS tracking, and AI-powered priority classification.',
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'Google Maps API'],
    githubUrl: 'https://github.com/example/smartaid',
    liveUrl: 'https://smartaid-demo.com',
    status: 'Completed',
    progress: 100,
    features: [
      { title: 'Real-time WebSocket telemetry for ambulance tracking', completed: true },
      { title: 'Priority dispatch queue using priority heap algorithm', completed: true },
      { title: 'Automated SMS notification bridge via Twilio', completed: true },
      { title: 'Admin analytics dashboard with incident heatmaps', completed: true }
    ],
    skillsDemonstrated: ['Full Stack Web Development', 'WebSockets', 'System Architecture', 'Database Indexing'],
    interviewPitch: 'SmartAid is an incident response system that reduced ambulance dispatch latency by 35% using WebSocket event streams and priority queue dispatch algorithms.'
  },
  {
    title: 'CogniVision — Deep Learning Multi-Class Image Classifier',
    description: 'High-throughput computer vision pipeline for automated defect detection in manufacturing using transfer learning on ResNet-50.',
    technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'OpenCV'],
    githubUrl: 'https://github.com/example/cognivision',
    liveUrl: '',
    status: 'In Progress',
    progress: 75,
    features: [
      { title: 'Fine-tuned ResNet-50 achieving 94.2% test accuracy', completed: true },
      { title: 'Data augmentation pipeline with rotation and color jitter', completed: true },
      { title: 'FastAPI inference microservice with ONNX runtime', completed: true },
      { title: 'Dockerized multi-stage container deployment', completed: false }
    ],
    skillsDemonstrated: ['Computer Vision', 'Deep Learning', 'PyTorch', 'Model Optimization', 'Docker'],
    interviewPitch: 'Built CogniVision to automate defect inspection, achieving 94.2% accuracy and 22ms inference latency by converting PyTorch weights to ONNX runtime.'
  },
  {
    title: 'RAG PDF Assistant — Enterprise Retrieval Augmented Generation',
    description: 'Context-grounded question answering platform for technical documentation with vector embeddings, semantic reranking, and citation tracking.',
    technologies: ['Python', 'LangChain', 'ChromaDB', 'Gemini API', 'Streamlit'],
    githubUrl: 'https://github.com/example/rag-pdf-assistant',
    liveUrl: '',
    status: 'In Progress',
    progress: 80,
    features: [
      { title: 'Recursive character chunking with 10% overlap', completed: true },
      { title: 'Chroma vector store with cosine similarity retrieval', completed: true },
      { title: 'Source citation generator and hallucination guardrails', completed: true },
      { title: 'Evaluation metrics using RAGAS framework', completed: false }
    ],
    skillsDemonstrated: ['Generative AI', 'Vector Databases', 'RAG Pipelines', 'Prompt Engineering'],
    interviewPitch: 'Engineered a RAG platform that parses complex multi-page technical manuals, providing zero-hallucination responses with verified page citations.'
  }
];
