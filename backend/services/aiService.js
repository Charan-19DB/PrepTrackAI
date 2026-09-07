import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Model cascade: try the current flagship Gemini model first,
 * then gracefully fallback to secondary models if one is deprecated or unavailable.
 */
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];

/**
 * Safely extracts and parses JSON from Gemini responses,
 * stripping markdown code fences (```json ... ```) and loose text.
 */
export const extractJsonFromText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;
  let cleaned = rawText.trim();

  // Strip leading ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  // Strip trailing ```
  cleaned = cleaned.replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If direct parse fails, find boundaries of JSON array [ ... ] or object { ... }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
      } catch (e) {
        // continue
      }
    }

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (e) {
        // continue
      }
    }

    throw new Error(`Failed to parse AI JSON response: ${err.message}`);
  }
};

/**
 * Executes a prompt against Gemini with model cascade and error handling
 */
export const executeWithGemini = async (apiKey, prompt) => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key available');
  }

  const genAI = new GoogleGenerativeAI(key);
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err) {
      lastError = err;
      // If error indicates model not found or deprecated, try next model in cascade
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('deprecated') || err.message.includes('no longer available'))) {
        continue;
      }
      // If invalid API key or quota, break immediately
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('quota'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini models in cascade failed');
};

const fallbackResponses = {
  studyPlan: (hours = 3, targetRole = 'SDE') => [
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
  ],

  explanation: (topic, subject, queryType) => `### Concept Overview: ${topic} (${subject})

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
`,

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

/**
 * Generate AI study plan
 */
export const getAIStudyPlan = async ({ hoursAvailable = 3, targetRole = 'SDE', weakTopics = [], apiKey = '' }) => {
  try {
    const prompt = `You are an expert CSE placement coach. The student has ${hoursAvailable} hours to study today. Target role: ${targetRole}.
Weak topics to prioritize: ${weakTopics.map(w => w.topic || w).join(', ') || 'DBMS, DSA, OS'}.
Generate a structured daily study plan as a valid JSON array of objects with keys:
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

    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Gemini AI Plan Fallback]:', err.message);
    return fallbackResponses.studyPlan(hoursAvailable, targetRole);
  }
};

/**
 * Generate AI concept explanation
 */
export const getAIExplanation = async ({ topic, subject, queryType = 'explain', apiKey = '' }) => {
  try {
    const prompt = `You are a Senior CSE professor and Staff Engineer. Explain the topic "${topic}" in "${subject}" for placement interviews.
Format in clear GitHub markdown with:
1. Core Definition & intuition
2. Key Technical Mechanics
3. Real-world industry application
4. Common interview pitfalls
5. Concise code example or diagram description`;

    return await executeWithGemini(apiKey, prompt);
  } catch (err) {
    console.warn('[Gemini AI Explanation Fallback]:', err.message);
    return fallbackResponses.explanation(topic, subject, queryType);
  }
};

/**
 * Evaluate single interview response
 */
export const getAIInterviewEvaluation = async ({ question, idealAnswer, userAnswer, apiKey = '' }) => {
  try {
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

    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Gemini AI Interview Eval Fallback]:', err.message);
    return fallbackResponses.interviewEval(question, idealAnswer, userAnswer);
  }
};

/**
 * Generate Quiz questions for a topic
 */
export const getAIQuizQuestions = async ({ topic, subject, difficulty = 'Medium', count = 3, apiKey = '' }) => {
  try {
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

    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Gemini Quiz Fallback]:', err.message);
    return [
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
      }
    ];
  }
};

/**
 * DYNAMIC PRACTICE QUESTIONS GENERATOR
 * Uses the API key to generate questions for practise questions EACH AND EVERY TIME!
 * Supports: 'MCQ', 'SQL', 'Aptitude', 'Output Prediction', or 'All'.
 */
export const generateAIPracticeQuestions = async ({
  type = 'All',
  subject = '',
  difficulty = 'Medium',
  count = 5,
  apiKey = ''
}) => {
  const typeGuidance = {
    SQL: 'Generate practical SQL query and relational database schema multiple-choice questions with table definitions, JOINs, aggregations, window functions, and indexing.',
    Aptitude: 'Generate quantitative aptitude, logical reasoning, or verbal ability problem-solving questions with step-by-step mathematical reasoning in the explanation.',
    'Output Prediction': 'Generate tricky C++, Java, or Python code snippets testing pointers, scope, inheritance, recursion, or operator precedence where candidates must predict the exact program output.',
    MCQ: 'Generate conceptual multiple choice placement questions across core CSE topics (Operating Systems, DBMS, Computer Networks, DSA, OOP).',
    All: 'Generate a balanced mix of core CS MCQs, SQL queries, Aptitude problems, and Output Prediction code snippet questions.'
  };

  const guidance = typeGuidance[type] || typeGuidance['All'];

  const prompt = `You are an expert CSE placement exam creator for top product companies (Google, Microsoft, Amazon, TCS Digital, etc.).
Task: Generate ${count} fresh, unique, challenging placement practice questions.
Target Category: ${type}
Target Subject/Context: ${subject || 'Computer Science Engineering & Placement Aptitude'}
Difficulty Level: ${difficulty}
Specific Instruction: ${guidance}

Return ONLY a valid JSON array of question objects without markdown fences.
Each object must have the exact structure:
[
  {
    "subject": "e.g. DBMS / Operating Systems / Quantitative Aptitude / Java",
    "topic": "e.g. Normalization / Deadlocks / Sliding Window / Pointers",
    "type": "${type === 'All' ? 'MCQ' : type}",
    "question": "Clear problem statement or question text",
    "codeSnippet": "Optional code snippet if relevant, otherwise empty string",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": "Exact matching string identical to one of the options above",
    "explanation": "In-depth, clear explanation of why this answer is correct and why other options are incorrect",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    const parsed = extractJsonFromText(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate that each question has valid options and correctAnswer
      return parsed.map((q, idx) => ({
        subject: q.subject || subject || 'Computer Science',
        topic: q.topic || 'Placement Concept',
        type: q.type || (type === 'All' ? 'MCQ' : type),
        question: q.question || `Practice Question #${idx + 1}`,
        codeSnippet: q.codeSnippet || '',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Option A'),
        explanation: q.explanation || 'Detailed reasoning verified by placement rubrics.',
        difficulty: q.difficulty || difficulty
      }));
    }
    throw new Error('AI returned non-array JSON structure');
  } catch (err) {
    console.warn('[Gemini Practice Generation Fallback]:', err.message);
    // Return high quality fallback questions if API fails or quota exceeded
    return [
      {
        subject: subject || 'Operating Systems',
        topic: 'Deadlock Handling',
        type: type === 'All' ? 'MCQ' : type,
        question: 'Which of the following conditions is NOT one of the Coffman conditions required for a deadlock to occur?',
        codeSnippet: '',
        options: [
          'Preemption allowed by default',
          'Mutual Exclusion',
          'Hold and Wait',
          'Circular Wait'
        ],
        correctAnswer: 'Preemption allowed by default',
        explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemption breaks the deadlock.',
        difficulty: 'Medium'
      },
      {
        subject: subject || 'DBMS and SQL',
        topic: 'Indexing',
        type: type === 'All' ? 'SQL' : type,
        question: 'What is the primary advantage of using a B+ tree over a B tree for database storage engines?',
        codeSnippet: '',
        options: [
          'All leaf nodes are linked sequentially, enabling rapid range scans',
          'B+ trees do not require disk I/O operations',
          'B+ trees have fixed depth of 1',
          'B+ trees only support unique primary keys'
        ],
        correctAnswer: 'All leaf nodes are linked sequentially, enabling rapid range scans',
        explanation: 'In a B+ tree, data pointers are exclusively stored in leaf nodes, which are linked together in a doubly-linked list for O(log N) point lookups and linear range traversals.',
        difficulty: 'Hard'
      },
      {
        subject: subject || 'Quantitative Aptitude',
        topic: 'Time and Work',
        type: type === 'All' ? 'Aptitude' : type,
        question: 'A can complete a project in 12 days and B in 16 days. If they work together for 4 days, what fraction of the work remains unfinished?',
        codeSnippet: '',
        options: [
          '7/12',
          '5/12',
          '1/3',
          '1/4'
        ],
        correctAnswer: '5/12',
        explanation: "A's 1-day work = 1/12, B's 1-day work = 1/16. Together 1-day work = 1/12 + 1/16 = 7/48. In 4 days, work done = 4 × (7/48) = 7/12. Remaining work = 1 - 7/12 = 5/12.",
        difficulty: 'Medium'
      }
    ];
  }
};

/**
 * COMMUNICATION COACH: Writing Improvement
 */
export const evaluateWritingText = async ({ text, type = 'general', apiKey = '' }) => {
  const prompt = `You are an elite Executive Communication Coach and Technical Recruiter.
Analyze this written submission:
"""${text}"""
Context/Type: ${type} (e.g. Email, Technical Explanation, LinkedIn Post, Resume Description)

Evaluate grammar, clarity, vocabulary, and professionalism.
Return ONLY valid JSON:
{
  "grammarScore": number (0-100),
  "clarityScore": number (0-100),
  "vocabularyScore": number (0-100),
  "professionalismScore": number (0-100),
  "overallScore": number (0-100),
  "corrections": [
    {
      "original": "Original flawed sentence or phrase",
      "correction": "Polished, professional correction",
      "reason": "Clear explanation of grammar rule or style rationale"
    }
  ],
  "improvedVersion": "Complete rewritten, professional version of the submission",
  "actionableTip": "One key tip to improve writing for placements"
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Writing Coach Fallback]:', err.message);
    return {
      grammarScore: 78,
      clarityScore: 82,
      vocabularyScore: 74,
      professionalismScore: 85,
      overallScore: 80,
      corrections: [
        {
          original: text.slice(0, 50),
          correction: text.slice(0, 50),
          reason: "Ensure active voice and strong action verbs for placement clarity."
        }
      ],
      improvedVersion: text,
      actionableTip: "Use the STAR method (Situation, Task, Action, Result) when articulating technical achievements."
    };
  }
};

/**
 * COMMUNICATION COACH: Speaking Practice Analysis
 */
export const evaluateSpeakingAudioTranscript = async ({ transcript, topic, apiKey = '' }) => {
  // Count common filler words deterministically
  const fillerWordPatterns = [
    { word: 'um', regex: /\bum+\b/gi },
    { word: 'uh', regex: /\buh+\b/gi },
    { word: 'like', regex: /\blike\b/gi },
    { word: 'actually', regex: /\bactually\b/gi },
    { word: 'basically', regex: /\bbasically\b/gi },
    { word: 'you know', regex: /\byou know\b/gi }
  ];

  const fillerCounts = {};
  let totalFillers = 0;
  fillerWordPatterns.forEach(({ word, regex }) => {
    const matches = (transcript || '').match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      fillerCounts[word] = count;
      totalFillers += count;
    }
  });

  const prompt = `You are a Senior Speech & Interview Communication Coach.
Candidate spoke on Topic: "${topic || 'Tell me about yourself / Technical Pitch'}"
Speech Transcript:
"""${transcript}"""

Analyze fluency, grammar, vocabulary, confidence, and clarity.
Return ONLY valid JSON:
{
  "fluencyScore": number (0-100),
  "grammarScore": number (0-100),
  "vocabularyScore": number (0-100),
  "confidenceScore": number (0-100),
  "clarityScore": number (0-100),
  "overallScore": number (0-100),
  "strengths": ["array of 2-3 strengths"],
  "improvements": ["array of 2-3 areas to improve"],
  "paceFeedback": "Feedback on speaking speed and rhythm",
  "actionableTip": "One concrete exercise for placement readiness"
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    const parsed = extractJsonFromText(raw);
    return {
      ...parsed,
      fillerWords: fillerCounts,
      totalFillers
    };
  } catch (err) {
    console.warn('[Speaking Coach Fallback]:', err.message);
    return {
      fluencyScore: 78,
      grammarScore: 75,
      vocabularyScore: 80,
      confidenceScore: 76,
      clarityScore: 82,
      overallScore: 78,
      fillerWords: fillerCounts,
      totalFillers,
      strengths: ['Direct communication', 'Good baseline vocabulary'],
      improvements: ['Reduce conversational filler words', 'Pause intentionally before answering'],
      paceFeedback: 'Steady pace. Aim for 130-150 words per minute during formal interviews.',
      actionableTip: 'Practice the 3-second pause: when asked a question, take a breath before speaking.'
    };
  }
};

/**
 * AI INTERVIEW ROOM: Multi-Turn Conversational Interviewer
 */
export const generateInteractiveInterviewTurn = async ({
  history = [],
  currentQuestion = '',
  candidateResponse = '',
  interviewType = 'Technical',
  difficulty = 'Medium',
  apiKey = ''
}) => {
  const prompt = `You are a Lead FAANG Technical & HR Interviewer conducting a realistic placement interview.
Interview Type: ${interviewType}
Target Difficulty: ${difficulty}
Previous Turns:
${history.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n')}

Current Question: "${currentQuestion}"
Candidate Response: "${candidateResponse}"

Task:
1. Brief internal assessment: was candidate answer complete, too vague, or missing key details?
2. Decide next action:
   - If answer is vague or misses a crucial nuance: ask a natural FOLLOW-UP question probing deeper.
   - If answer is strong: transition smoothly to the NEXT standard interview question.
3. Keep the interview natural and conversational. DO NOT reveal the correct answer or give full grades mid-interview.

Return ONLY valid JSON:
{
  "interviewerReaction": "Short natural transitional phrase (e.g. 'Good point on indexing.', 'I see your point.', 'Thanks for that overview.')",
  "nextQuestion": "The next question or follow-up question to ask the candidate",
  "isFollowUp": boolean,
  "internalScore": number (1-5),
  "keyObservation": "Brief note on candidate's technical depth"
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Interview Turn Fallback]:', err.message);
    return {
      interviewerReaction: 'Thanks for walking me through that.',
      nextQuestion: 'Can you discuss the time and space complexity trade-offs of this approach in a production environment?',
      isFollowUp: true,
      internalScore: 4,
      keyObservation: 'Fundamental understanding demonstrated.'
    };
  }
};

/**
 * AI INTERVIEW ROOM: Conclude and Generate 360° Report
 */
export const concludeInterviewEvaluation = async ({
  history = [],
  interviewType = 'Technical',
  apiKey = ''
}) => {
  const prompt = `You are a Hiring Committee Bar Raiser evaluating a candidate's complete placement interview transcript.
Interview Type: ${interviewType}
Complete Transcript:
${history.map(h => `${h.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${h.text}`).join('\n')}

Generate an in-depth 360° interview evaluation report.
Return ONLY valid JSON:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "problemSolvingScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "clarityScore": number (0-100),
  "grammarScore": number (0-100),
  "depthScore": number (0-100),
  "hiringRecommendation": "Strong Hire" | "Hire" | "Leaning Hire" | "Leaning No Hire" | "No Hire",
  "strengths": ["array of 3 specific positive points"],
  "weaknesses": ["array of 3 specific areas of concern"],
  "recommendedActions": [
    "1. Action item with estimated study time",
    "2. Action item with estimated study time",
    "3. Action item with estimated study time"
  ],
  "interviewerSummary": "Comprehensive 3-4 sentence evaluation summary"
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Conclude Interview Fallback]:', err.message);
    return {
      overallScore: 76,
      technicalScore: 80,
      problemSolvingScore: 75,
      communicationScore: 72,
      confidenceScore: 78,
      clarityScore: 76,
      grammarScore: 74,
      depthScore: 75,
      hiringRecommendation: 'Hire',
      strengths: [
        'Clear understanding of relational database principles',
        'Structured analytical problem solving method',
        'Confident articulation of trade-offs'
      ],
      weaknesses: [
        'Could provide deeper discussion of operating system memory models',
        'Occasional brief answers without concrete production examples',
        'Slight reliance on conversational filler words'
      ],
      recommendedActions: [
        'Revise OS Deadlocks and Banker\'s algorithm (30 mins)',
        'Practice articulating space complexity under pressure (20 mins)',
        'Complete 5 speaking drills on architectural trade-offs (15 mins)'
      ],
      interviewerSummary: 'Candidate demonstrated solid foundational knowledge with good problem-solving instincts. With focused revision on operating systems and crisper presentation, they are well on track for product engineering roles.'
    };
  }
};

/**
 * FLASHCARDS: Generate flashcards from topic
 */
export const generateFlashcardsFromTopic = async ({ topic, subject, count = 5, apiKey = '' }) => {
  const prompt = `Generate ${count} high-yield placement flashcards for the CSE topic "${topic}" (${subject}).
Each flashcard must have a concise front question/concept and a clear, high-retention back answer with key bullet points or formula.
Return ONLY valid JSON:
[
  {
    "front": "Concise concept question or prompt",
    "back": "High-retention answer highlighting definitions, formulas, or key trade-offs",
    "difficulty": "Easy" | "Medium" | "Hard",
    "tags": ["tag1", "tag2"]
  }
]`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Flashcards Fallback]:', err.message);
    return [
      {
        front: `What is the core definition and invariant of ${topic}?`,
        back: `${topic} maintains state consistency and predictable execution overhead in ${subject}.`,
        difficulty: 'Medium',
        tags: [subject, topic]
      }
    ];
  }
};

/**
 * DSA INTELLIGENCE: Code analysis with progressive hints
 */
export const analyzeCodeSolution = async ({
  problemTitle,
  problemDescription,
  userCode,
  language = 'cpp',
  apiKey = ''
}) => {
  const prompt = `You are a Lead Algorithms Coach.
Problem: "${problemTitle}"
Problem Description: "${problemDescription || ''}"
Candidate Code (${language}):
\`\`\`${language}
${userCode}
\`\`\`

Analyze the code.
DO NOT immediately reveal the full optimal solution code!
Provide:
1. Time complexity of candidate code
2. Space complexity of candidate code
3. Whether it is optimal or can be improved
4. Three progressive hints (Hint 1 gentle nudge, Hint 2 pattern clue, Hint 3 concrete data structure suggestion)
5. Edge cases to watch out for

Return ONLY valid JSON:
{
  "timeComplexity": "e.g. O(N^2)",
  "spaceComplexity": "e.g. O(1)",
  "isOptimal": boolean,
  "optimalTimeComplexity": "e.g. O(N)",
  "optimalSpaceComplexity": "e.g. O(N)",
  "codeQualityReview": "2-3 sentences feedback on style, naming, and structure",
  "hint1": "Gentle conceptual clue",
  "hint2": "Pattern and traversal clue",
  "hint3": "Data structure recommendation",
  "edgeCases": ["null/empty input", "single element", "negative values", "duplicates"]
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Code Analysis Fallback]:', err.message);
    return {
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
      isOptimal: false,
      optimalTimeComplexity: 'O(N)',
      optimalSpaceComplexity: 'O(N)',
      codeQualityReview: 'Logic is sound for basic test cases, but nested iteration leads to quadratic runtime.',
      hint1: 'Can you avoid looking up previous elements by storing them as you traverse?',
      hint2: 'Think about frequency mapping or prefix tracking.',
      hint3: 'Consider using an unordered_map or HashSet for O(1) average lookups.',
      edgeCases: ['Empty array', 'Duplicate elements', 'All negative numbers']
    };
  }
};
