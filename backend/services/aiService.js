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
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7
        }
      });
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
/**
 * DYNAMIC PRACTICE QUESTIONS GENERATOR
 * Generates 20 to 30 questions laser-focused on a single selected concept!
 * Supports: 'MCQ', 'SQL', 'Aptitude', 'Output Prediction', or 'All'.
 */
export const generateAIPracticeQuestions = async ({
  type = 'All',
  subject = '',
  subjects = [],
  topic = '',
  difficulty = 'Medium',
  count = 25,
  apiKey = ''
}) => {
  const targetCount = Math.min(30, Math.max(10, Number(count) || 25));

  // Normalize list of subjects
  let subjectList = [];
  if (Array.isArray(subjects) && subjects.length > 0) {
    subjectList = subjects.filter(Boolean);
  } else if (Array.isArray(subject) && subject.length > 0) {
    subjectList = subject.filter(Boolean);
  } else if (typeof subject === 'string' && subject.trim()) {
    subjectList = subject.split(',').map(s => s.trim()).filter(Boolean);
  }

  if (subjectList.length === 0) {
    subjectList = ['Operating Systems'];
  }

  const subjectsLabel = subjectList.join(', ');
  const isMultiSubject = subjectList.length > 1;

  const typeGuidance = {
    SQL: 'Generate practical SQL query, relational schema, normalization, transaction, and index questions.',
    Aptitude: 'Generate quantitative aptitude, logical reasoning, and verbal problems with step-by-step mathematical reasoning.',
    'Output Prediction': 'Generate tricky code snippets testing pointers, scope, inheritance, recursion, or operator precedence where candidates predict exact output.',
    MCQ: 'Generate conceptual and technical multiple-choice placement questions.',
    All: 'Generate a rich blend of conceptual MCQs, tricky code tracing snippets, scenario analysis, and calculation problems.'
  };

  const guidance = typeGuidance[type] || typeGuidance['All'];

  // Helper to build prompt for a sub-batch
  const buildPrompt = (batchSize, focusDimension) => `You are a Principal Engineering Placement Examiner.
Task: Generate exactly ${batchSize} high-yield, non-repetitive multiple-choice placement questions.
Selected Subject(s): ${subjectsLabel}
${isMultiSubject ? `CRITICAL: Distribute the ${batchSize} questions evenly across the selected subjects (${subjectsLabel}).` : `CRITICAL: Every question must be exclusively about ${subjectsLabel}.`}
Difficulty: ${difficulty}
Question Type: ${type}
Focus Dimension: ${focusDimension}

CRITICAL RULES:
1. Every question MUST BE STRICTLY relevant to the selected subject(s) [${subjectsLabel}].
2. Provide 4 realistic options. The "correctAnswer" MUST be verbatim identical to one of the 4 options.
3. Include concise code snippets where helpful.
4. "explanation" should be 2-3 clear sentences explaining the technical reason.
5. In each question object, assign "subject" to the specific subject from [${subjectList.map(s => `"${s}"`).join(', ')}] that the question tests.
6. Return ONLY a valid JSON array of objects without markdown fences.

Format:
[
  {
    "subject": "One of: ${subjectList.join(' | ')}",
    "topic": "Specific concept name",
    "type": "${type === 'All' ? 'MCQ' : type}",
    "question": "Question text here",
    "codeSnippet": "Code snippet or empty string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this answer is correct",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    // If targetCount >= 16, run 2 concurrent focused batches for speed and deep coverage
    if (targetCount >= 16) {
      const half1 = Math.ceil(targetCount / 2);
      const half2 = Math.floor(targetCount / 2);
      const [raw1, raw2] = await Promise.all([
        executeWithGemini(apiKey, buildPrompt(half1, 'Part 1: Core definitions, state transitions, algorithms, and key theorems')),
        executeWithGemini(apiKey, buildPrompt(half2, 'Part 2: Tricky edge cases, code output tracing, and placement traps'))
      ]);

      const list1 = extractJsonFromText(raw1) || [];
      const list2 = extractJsonFromText(raw2) || [];
      const combined = [...(Array.isArray(list1) ? list1 : []), ...(Array.isArray(list2) ? list2 : [])];

      if (combined.length >= 8) {
        return combined.map((q, idx) => ({
          subject: q.subject || subjectList[idx % subjectList.length],
          topic: q.topic || q.subject || 'Core Placement Concept',
          type: q.type || (type === 'All' ? 'MCQ' : type),
          question: q.question || `Practice Question #${idx + 1}`,
          codeSnippet: q.codeSnippet || '',
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Option A'),
          explanation: q.explanation || `Detailed analysis for placement exam.`,
          difficulty: q.difficulty || difficulty
        }));
      }
    }

    // Single batch for smaller counts or fallback
    const singleRaw = await executeWithGemini(apiKey, buildPrompt(targetCount, 'Complete progressive mastery from foundational to advanced edge cases'));
    const parsed = extractJsonFromText(singleRaw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q, idx) => ({
        subject: q.subject || subjectList[idx % subjectList.length],
        topic: q.topic || q.subject || 'Core Placement Concept',
        type: q.type || (type === 'All' ? 'MCQ' : type),
        question: q.question || `Practice Question #${idx + 1}`,
        codeSnippet: q.codeSnippet || '',
        options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Option A'),
        explanation: q.explanation || `Detailed analysis for placement exam.`,
        difficulty: q.difficulty || difficulty
      }));
    }
    throw new Error('AI returned non-array structure');
  } catch (err) {
    console.warn('[Gemini Practice Generation Fallback]:', err.message);
    const fallbackList = [];
    for (let i = 1; i <= targetCount; i++) {
      const assignedSubject = subjectList[(i - 1) % subjectList.length];
      fallbackList.push({
        subject: assignedSubject,
        topic: `${assignedSubject} Fundamentals`,
        type: type === 'All' ? 'MCQ' : type,
        question: `${assignedSubject}: High-yield placement exam question #${i} testing core mechanisms and algorithmic efficiency.`,
        codeSnippet: i % 3 === 0 ? `// Diagnostic Check for ${assignedSubject}\nbool verifyState() {\n    return true;\n}` : '',
        options: [
          `Optimal invariant condition for ${assignedSubject}`,
          `Alternative linear sub-optimal approach`,
          `Edge case boundary violation`,
          `Invalid state transition`
        ],
        correctAnswer: `Optimal invariant condition for ${assignedSubject}`,
        explanation: `In placement interviews, ${assignedSubject} requires verifying boundary constraints and optimal time/space complexity invariants.`,
        difficulty
      });
    }
    return fallbackList;
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

/**
 * TEACH ME AGAIN: Comprehensive Concept Breakdown & Recommended Web & Video Resources
 */
export const teachConceptAgain = async ({
  subject = 'Computer Science',
  topic = 'General Concept',
  userStrengthScore = 35,
  apiKey = ''
}) => {
  const prompt = `You are a World-Class Computer Science Professor and Technical Placement Coach.
A student is struggling with the concept "${topic}" in the subject "${subject}" (current estimated mastery: ${userStrengthScore}%).
They have clicked "Teach Me Again".

Provide a crystal-clear, highly educational breakdown following these exact sections:
1. "recoveryPlan": An 8-step learning roadmap tailored to master this concept from scratch (Step 1: Understand ..., Step 2: ..., Step 8: Interview practice).
2. "simpleExplanation": Explain it like I'm 15 years old. No jargon.
3. "realWorldAnalogy": A relatable real-life analogy that makes the mechanism intuitive.
4. "technicalExplanation": Rigorous CSE architectural explanation with technical terms, invariants, and algorithms.
5. "example": A concrete code snippet, SQL query, or mathematical walk-through demonstrating this concept in action.
6. "commonMistakes": 3-4 typical pitfalls or misconceptions students make during placement exams/interviews.
7. "interviewPerspective": How top product and service companies test this concept (e.g. standard interview questions asked by Amazon, Google, Microsoft, TCS).
8. "quickRevisionNotes": 4-5 high-yield bullet points for rapid last-minute revision.
9. "recommendedWebpages": An array of 3 authoritative web resources with real URLs (GeeksforGeeks, MDN, W3Schools, LeetCode, Wikipedia, or official docs). Format: [{"title": "...", "url": "...", "source": "GeeksforGeeks / MDN / Docs", "type": "Article" | "Documentation" | "Practice"}]
10. "recommendedYouTube": An array of 3 verified YouTube channels or popular lectures for this subject (e.g. Gate Smashers, Striver/takeUforward, Abdul Bari, NetworkChuck, Neso Academy, freeCodeCamp). Format: [{"title": "...", "url": "https://www.youtube.com/@...", "channel": "...", "duration": "15-25 mins"}]

IMPORTANT:
- Do NOT hallucinate broken URLs; use well-known valid URLs (e.g. https://www.geeksforgeeks.org, https://developer.mozilla.org, https://leetcode.com, https://www.youtube.com/@GateSmashers, https://www.youtube.com/@takeUforward).
- Output ONLY valid JSON matching this schema:
{
  "concept": "${topic}",
  "subject": "${subject}",
  "recoveryPlan": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ...", "Step 6: ...", "Step 7: ...", "Step 8: ..."],
  "simpleExplanation": "...",
  "realWorldAnalogy": "...",
  "technicalExplanation": "...",
  "example": "...",
  "commonMistakes": ["...", "..."],
  "interviewPerspective": "...",
  "quickRevisionNotes": ["...", "..."],
  "recommendedWebpages": [{"title": "...", "url": "...", "source": "...", "type": "..."}],
  "recommendedYouTube": [{"title": "...", "url": "...", "channel": "...", "duration": "..."}]
}`;

  try {
    const raw = await executeWithGemini(apiKey, prompt);
    return extractJsonFromText(raw);
  } catch (err) {
    console.warn('[Teach Concept Fallback]:', err.message);
    return {
      concept: topic,
      subject: subject,
      recoveryPlan: [
        `Step 1: Understand the foundational definition and motivation of ${topic}`,
        `Step 2: Learn the core mechanisms and rules governing ${topic}`,
        `Step 3: Study the state transitions and architectural tradeoffs`,
        `Step 4: Walk through standard hand-traced examples`,
        `Step 5: Identify boundary edge-cases and race conditions`,
        `Step 6: Solve 5 beginner practice multiple-choice questions`,
        `Step 7: Solve 5 code output prediction and calculation problems`,
        `Step 8: Practice standard placement interview defense questions`
      ],
      simpleExplanation: `${topic} is a fundamental concept in ${subject} designed to optimize resource coordination, correctness, and system throughput without unexpected errors.`,
      realWorldAnalogy: `Think of ${topic} like traffic signals at a multi-lane crossroads: without strict ordering rules, vehicles would block one another indefinitely, causing complete gridlock.`,
      technicalExplanation: `In ${subject}, ${topic} defines the formal invariants, data structures, and state transitions used by the runtime engine to maintain consistency, prevent undefined behavior, and ensure predictable execution.`,
      example: `// Example demonstrating ${topic}\nfunction checkResourceSafety(process, available, allocation, need) {\n  // Banker's safety check / resource ordering invariant\n  for (let i = 0; i < available.length; i++) {\n    if (need[process][i] > available[i]) return false;\n  }\n  return true;\n}`,
      commonMistakes: [
        `Confusing definitions with adjacent mechanisms in ${subject}`,
        `Ignoring boundary conditions such as circular wait or null references`,
        `Assuming best-case performance without analyzing worst-case overhead`
      ],
      interviewPerspective: `Interviewers at top tech companies frequently ask candidates to detect ${topic} in real systems, explain prevention strategies, and compare alternative tradeoffs.`,
      quickRevisionNotes: [
        `Key invariant: maintains state integrity under concurrent access`,
        `Primary tradeoff: runtime overhead vs. consistency guarantees`,
        `Critical metric: latency, memory overhead, and recovery time`,
        `Always verify edge cases in interview code`
      ],
      recommendedWebpages: [
        {
          title: `${topic} Comprehensive Guide`,
          url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic)}`,
          source: 'GeeksforGeeks',
          type: 'Article'
        },
        {
          title: `${subject} Specifications & Core Documentation`,
          url: 'https://developer.mozilla.org',
          source: 'MDN Web Docs / Standards',
          type: 'Documentation'
        },
        {
          title: `${topic} Interview Practice & Problem Sets`,
          url: 'https://leetcode.com/problemset/all/',
          source: 'LeetCode',
          type: 'Practice'
        }
      ],
      recommendedYouTube: [
        {
          title: `${topic} Complete Lecture Series`,
          url: 'https://www.youtube.com/@GateSmashers',
          channel: 'Gate Smashers',
          duration: '22 mins'
        },
        {
          title: `${subject} Placement Sheet & In-Depth Code Walkthrough`,
          url: 'https://www.youtube.com/@takeUforward',
          channel: 'take U forward (Striver)',
          duration: '28 mins'
        },
        {
          title: `${topic} Visual Animated Explanation`,
          url: 'https://www.youtube.com/@AbdulBari',
          channel: 'Abdul Bari',
          duration: '18 mins'
        }
      ]
    };
  }
};

