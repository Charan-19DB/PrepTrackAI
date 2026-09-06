import { GoogleGenerativeAI } from '@google/generative-ai';

const fallbackResponses = {
  studyPlan: (hours = 3, targetRole = 'SDE') => {
    return [
      {
        timeSlot: 'Morning',
        subject: 'DBMS and SQL',
        topic: 'Normalization',
        subtopic: '3NF and BCNF Functional Dependencies',
        estimatedDuration: 45,
        difficulty: 'Medium',
        priority: 'High',
        notes: 'Review Armstrong axioms and lossless decomposition'
      },
      {
        timeSlot: 'Morning',
        subject: 'Data Structures and Algorithms',
        topic: 'Sliding Window',
        subtopic: 'Variable Size Window & Max Subarray',
        estimatedDuration: 60,
        difficulty: 'Hard',
        priority: 'High',
        notes: 'Solve LeetCode #3 Longest Substring Without Repeating Characters'
      },
      {
        timeSlot: 'Afternoon',
        subject: 'Python Programming',
        topic: 'Dictionaries and Hash Maps',
        subtopic: 'dict comprehension and get default',
        estimatedDuration: 30,
        difficulty: 'Easy',
        priority: 'Medium',
        notes: 'Write frequency map utilities'
      },
      {
        timeSlot: 'Evening',
        subject: 'Quantitative Aptitude',
        topic: 'Percentages and Profit & Loss',
        subtopic: 'Successive percentage changes',
        estimatedDuration: 30,
        difficulty: 'Medium',
        priority: 'Medium',
        notes: 'Solve 10 practice problems under 15 minutes'
      },
      {
        timeSlot: 'Night',
        subject: 'Operating Systems',
        topic: 'Deadlocks',
        subtopic: 'Banker\'s Algorithm & Resource Allocation Graph',
        estimatedDuration: 35,
        difficulty: 'Medium',
        priority: 'High',
        notes: 'Revise weak area: 4 necessary conditions for deadlock'
      }
    ];
  },

  explanation: (topic, subject, queryType) => {
    return `### Concept Overview: ${topic} (${subject})

**1. Core Definition:**
\`${topic}\` is a foundational concept in ${subject}. In technical interviews, interviewers evaluate both theoretical depth and implementation efficiency.

**2. Key Technical Mechanics:**
- **Why it matters:** Solves performance bottlenecks and ensures maintainability.
- **Internal working:** Leverages optimized data layouts, indexing structures, or state transitions to achieve sub-quadratic or logarithmic efficiency.
- **Space & Time Tradeoffs:** Balances memory footprint against computational throughput.

**3. Real-World Industry Application:**
Used extensively in distributed high-throughput backends, transactional databases, operating system schedulers, and modern cloud microservices.

**4. Top Interview Pitfall:**
Candidate often forgets edge cases: null/empty inputs, integer overflow, concurrency race conditions, and non-linear scalability.

**5. Quick Code Example:**
\`\`\`cpp
// Efficient pattern for ${topic}
void solve() {
    // 1. Validate constraints
    // 2. Initialize tracking pointers / hash state
    // 3. Process stream in O(N) linear time
}
\`\`\`
`;
  },

  interviewEval: (question, idealAnswer, userAnswer) => {
    const wordCount = (userAnswer || '').trim().split(/\s+/).length;
    let score = 4;
    let feedback = "Strong foundational answer! You clearly addressed the fundamental principles.";
    let missingPoints = ["Mention real-world scalability tradeoffs", "Include time/space complexity analysis"];

    if (wordCount < 15) {
      score = 2;
      feedback = "Answer is too brief. In technical interviews, explain the 'why', provide a concrete scenario, and cite trade-offs.";
      missingPoints = ["Provide a formal definition", "Give a code or architectural example", "Mention alternative approaches"];
    } else if (wordCount > 60) {
      score = 5;
      feedback = "Outstanding comprehensive answer. You covered definitions, edge cases, and practical trade-offs thoroughly.";
      missingPoints = ["Consider adding a quick mention of cloud/distributed nuances if applicable."];
    }

    return {
      accuracyScore: score,
      completenessScore: score,
      confidenceScore: Math.min(5, score + 1),
      summaryFeedback: feedback,
      missingPoints,
      strengths: ["Clear technical terminology", "Structured flow"],
      suggestedImprovement: "Practice articulating this in under 60 seconds with an elevator pitch structure: Definition -> Mechanics -> Tradeoff -> Example."
    };
  }
};

export const getAIStudyPlan = async ({ hoursAvailable = 3, targetRole = 'SDE', weakTopics = [], apiKey = '' }) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return fallbackResponses.studyPlan(hoursAvailable, targetRole);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert CSE placement coach. The student has ${hoursAvailable} hours to study today. Target role: ${targetRole}.
Weak topics to prioritize: ${weakTopics.map(w => w.topic || w).join(', ') || 'DBMS, DSA, OS'}.
Generate a structured daily study plan as valid JSON array of objects with keys:
[
  {
    "timeSlot": "Morning" | "Afternoon" | "Evening" | "Night",
    "subject": "Subject Name",
    "topic": "Topic Name",
    "subtopic": "Specific subtopic",
    "estimatedDuration": number (in minutes),
    "difficulty": "Easy" | "Medium" | "Hard",
    "priority": "High" | "Medium",
    "notes": "Actionable task instructions"
  }
]
Return ONLY JSON without markdown fences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '');
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini AI Plan Fallback]:', err.message);
    return fallbackResponses.studyPlan(hoursAvailable, targetRole);
  }
};

export const getAIExplanation = async ({ topic, subject, queryType = 'explain', apiKey = '' }) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return fallbackResponses.explanation(topic, subject, queryType);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a Senior CSE professor and Staff Engineer. Explain the topic "${topic}" in "${subject}" for placement interviews.
Format in clear GitHub markdown with:
1. Core Definition & intuition
2. Key Technical Mechanics
3. Real-world industry application
4. Common interview pitfalls
5. Concise code example or diagram description`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn('[Gemini AI Explanation Fallback]:', err.message);
    return fallbackResponses.explanation(topic, subject, queryType);
  }
};

export const getAIInterviewEvaluation = async ({ question, idealAnswer, userAnswer, apiKey = '' }) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    return fallbackResponses.interviewEval(question, idealAnswer, userAnswer);
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a Lead FAANG Technical Interviewer.
Question: "${question}"
Ideal Answer reference: "${idealAnswer || ''}"
Candidate Answer: "${userAnswer}"

Evaluate candidate's response. Return ONLY valid JSON in format:
{
  "accuracyScore": number (1 to 5),
  "completenessScore": number (1 to 5),
  "confidenceScore": number (1 to 5),
  "summaryFeedback": "2-3 sentences concise critique",
  "missingPoints": ["array", "of", "missed concepts"],
  "strengths": ["array", "of", "positives"],
  "suggestedImprovement": "one actionable tip for placement interviews"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '');
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini AI Interview Eval Fallback]:', err.message);
    return fallbackResponses.interviewEval(question, idealAnswer, userAnswer);
  }
};

export const getAIQuizQuestions = async ({ topic, subject, difficulty = 'Medium', count = 3, apiKey = '' }) => {
  const defaultQuestions = [
    {
      question: `What is the primary operational advantage of ${topic} in modern computer systems?`,
      options: [
        `Optimal asymptotic complexity and predictable throughput`,
        `Guaranteed zero memory allocation overhead`,
        `Requires no compile-time type validation`,
        `Bypasses operating system kernel mode entirely`
      ],
      correctAnswer: `Optimal asymptotic complexity and predictable throughput`,
      explanation: `${topic} is designed to minimize runtime overhead while maintaining formal invariant guarantees.`
    },
    {
      question: `Which of the following conditions or edge-cases must be strictly handled when implementing ${topic}?`,
      options: [
        `Handling null pointers, empty collections, and boundary states`,
        `Converting dynamic structures into static singletons`,
        `Disabling multithreaded synchronization locks`,
        `Ignoring hardware cache coherence`
      ],
      correctAnswer: `Handling null pointers, empty collections, and boundary states`,
      explanation: `Robust implementations of ${topic} must always guard against edge conditions to prevent runtime exceptions.`
    },
    {
      question: `In technical placement interviews, what is the typical expected time complexity associated with ${topic}?`,
      options: [
        `O(1) average or O(log N) / O(N) depending on state space`,
        `Always strictly O(N!)`,
        `O(2^N) exponential`,
        `Unbounded non-deterministic execution`
      ],
      correctAnswer: `O(1) average or O(log N) / O(N) depending on state space`,
      explanation: `Interview standards prioritize algorithms and data representations with sub-quadratic time bounds.`
    }
  ];

  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return defaultQuestions;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Generate ${count} multiple choice questions (MCQ) for CSE students on "${topic}" (${subject}) at ${difficulty} level.
Return ONLY valid JSON format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact Option text matching one of options",
    "explanation": "Clear reason why this is correct"
  }
]`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '');
    return JSON.parse(text);
  } catch (err) {
    return defaultQuestions;
  }
};
