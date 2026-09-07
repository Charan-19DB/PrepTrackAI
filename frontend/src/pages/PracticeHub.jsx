import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookmarkPlus,
  BarChart2,
  Check,
  X,
  Plus,
  RefreshCw,
  Cpu,
  Layers,
  Filter,
  Zap,
  Target,
  BookOpen,
  Search,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const POPULAR_SUBJECTS = [
  'Operating Systems',
  'DBMS and SQL',
  'Computer Networks',
  'Data Structures and Algorithms',
  'OOP',
  'Python Programming',
  'Java Programming',
  'Quantitative Aptitude',
  'Logical Reasoning'
];

const QUESTION_COUNTS = [20, 25, 30];

export const PracticeHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'Operating Systems';
  const initialTopic = searchParams.get('topic') || '';

  // Studio / Selection State
  const [showStudio, setShowStudio] = useState(!initialTopic);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedConcept, setSelectedConcept] = useState(initialTopic);
  const [selectedCount, setSelectedCount] = useState(25);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedType, setSelectedType] = useState('All');
  const [conceptSearch, setConceptSearch] = useState('');
  const [availableConcepts, setAvailableConcepts] = useState([]);
  const [loadingConcepts, setLoadingConcepts] = useState(false);

  // Active Quiz State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [mistakeAdded, setMistakeAdded] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [answersHistory, setAnswersHistory] = useState({}); // { [index]: { selected, isCorrect, submitted } }

  // Load concepts whenever selectedSubject changes
  useEffect(() => {
    fetchConceptsForSubject(selectedSubject);
  }, [selectedSubject]);

  // If initial URL had topic and subject, auto-load or generate
  useEffect(() => {
    if (initialSubject && initialTopic) {
      setSelectedSubject(initialSubject);
      setSelectedConcept(initialTopic);
      setShowStudio(false);
      startConceptPractice(initialSubject, initialTopic, 25);
    }
    fetchStats();
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (!submitted && !quizCompleted && questions.length > 0) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [submitted, currentIndex, quizCompleted, questions.length]);

  const fetchConceptsForSubject = async (subjectName) => {
    try {
      setLoadingConcepts(true);
      const res = await api.get(`/practice/concepts?subject=${encodeURIComponent(subjectName)}`);
      const list = Array.isArray(res.data) ? res.data : [];
      setAvailableConcepts(list);
      // Auto-select first concept if none selected
      if (list.length > 0 && (!selectedConcept || !list.some(c => c.name === selectedConcept))) {
        setSelectedConcept(list[0].name);
      }
    } catch (err) {
      console.error('Failed to load concepts for subject', err);
    } finally {
      setLoadingConcepts(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/practice/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load practice stats', err);
    }
  };

  const startConceptPractice = async (subjectToUse, conceptToUse, countToUse) => {
    const subj = subjectToUse || selectedSubject;
    const concept = conceptToUse || selectedConcept;
    const qCount = countToUse || selectedCount;

    if (!concept) {
      setErrorMessage('Please choose a concept to practice.');
      return;
    }

    try {
      setGenerating(true);
      setErrorMessage('');
      setQuizCompleted(false);
      setAnswersHistory({});

      const res = await api.post('/practice/generate-fresh', {
        subject: subj,
        topic: concept,
        count: qCount,
        difficulty: selectedDifficulty,
        type: selectedType
      });

      const list = res.data?.questions || [];
      if (list.length > 0) {
        setQuestions(list);
        setCurrentIndex(0);
        setSelectedAnswer('');
        setSubmitted(false);
        setResult(null);
        setSeconds(0);
        setMistakeAdded(false);
        setShowStudio(false);
        setSearchParams({ subject: subj, topic: concept });
      } else {
        setErrorMessage('Could not generate questions for this concept. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate practice set', err);
      setErrorMessage(err.response?.data?.message || 'Error generating questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !questions[currentIndex]) return;
    const currentQ = questions[currentIndex];

    try {
      const res = await api.post('/practice/attempt', {
        questionId: currentQ._id,
        selectedAnswer,
        timeTakenSeconds: seconds
      });

      setResult(res.data);
      setSubmitted(true);
      setAnswersHistory(prev => ({
        ...prev,
        [currentIndex]: {
          selected: selectedAnswer,
          isCorrect: res.data.isCorrect,
          submitted: true,
          explanation: res.data.explanation
        }
      }));

      if (res.data.isCorrect) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
      fetchStats();
    } catch (err) {
      console.error('Error submitting answer', err);
    }
  };

  const handleAddToMistakes = async () => {
    if (!questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    try {
      await api.post('/mistakes', {
        questionId: currentQ._id,
        question: currentQ.question,
        myAnswer: selectedAnswer,
        correctAnswer: currentQ.correctAnswer,
        whyWrong: `Missed during ${selectedConcept || currentQ.topic} drill test`,
        subject: currentQ.subject,
        topic: currentQ.topic,
        difficulty: currentQ.difficulty
      });
      setMistakeAdded(true);
    } catch (err) {
      console.error('Failed to add to mistakes', err);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    } else {
      setQuizCompleted(true);
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
    }
  };

  const jumpToQuestion = (idx) => {
    setCurrentIndex(idx);
    const existing = answersHistory[idx];
    if (existing) {
      setSelectedAnswer(existing.selected);
      setSubmitted(true);
      setResult({ isCorrect: existing.isCorrect, explanation: existing.explanation });
    } else {
      setSelectedAnswer('');
      setSubmitted(false);
      setResult(null);
      setSeconds(0);
      setMistakeAdded(false);
    }
  };

  // Filter available concepts by search query
  const filteredConcepts = useMemo(() => {
    if (!conceptSearch.trim()) return availableConcepts;
    return availableConcepts.filter(c => 
      c.name.toLowerCase().includes(conceptSearch.toLowerCase()) ||
      (c.subtopics && c.subtopics.some(s => s.toLowerCase().includes(conceptSearch.toLowerCase())))
    );
  }, [availableConcepts, conceptSearch]);

  const currentQ = questions.length > 0 ? questions[currentIndex] : null;

  // Compute total correct in active drill
  const correctCount = Object.values(answersHistory).filter(a => a.isCorrect).length;
  const attemptedCount = Object.keys(answersHistory).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Concept Mastery Studio & Practice Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Placement Practice & Quizzes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate 20 to 30 comprehensive questions focused strictly on a single concept at a time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStudio(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>{showStudio ? 'Close Concept Picker' : '🎯 Choose Concept (20–30 Qs)'}</span>
          </button>

          {stats && (
            <div className="hidden sm:flex items-center gap-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-2xl shadow-sm">
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Accuracy</span>
                <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                  {stats.accuracy || stats.overallAccuracy || 80}%
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-dark-border" />
              <div>
                <span className="text-xs text-gray-400 block font-medium">Attempts</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  {stats.total || stats.totalAttempts || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="p-1 text-rose-500 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONCEPT SELECTION STUDIO ("Multiple choice for the concepts") */}
      {/* ========================================================================= */}
      {showStudio && (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-brand-500/30 p-6 md:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-border/60 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                Select Concept & Question Volume (20 to 30 Questions)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                All questions in this test will be exclusively generated on the concept you pick. No unrelated concepts mixed in.
              </p>
            </div>
          </div>

          {/* STEP 1: Select Subject */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
              Step 1: Choose Subject
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {POPULAR_SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedSubject === subj
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Choose Concept (Multiple-choice format) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Step 2: Choose Concept (Multiple Choice Options)
              </label>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={conceptSearch}
                  onChange={(e) => setConceptSearch(e.target.value)}
                  placeholder="Filter concepts..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-xs text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {loadingConcepts ? (
              <div className="h-32 rounded-2xl bg-gray-100 dark:bg-dark-surface animate-pulse flex items-center justify-center text-xs text-gray-400">
                Loading {selectedSubject} concepts...
              </div>
            ) : filteredConcepts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-surface text-center text-xs text-gray-400">
                No concepts found matching "{conceptSearch}". Try another term.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {filteredConcepts.map((conceptItem) => {
                  const isSelected = selectedConcept === conceptItem.name;
                  return (
                    <button
                      key={conceptItem._id || conceptItem.name}
                      onClick={() => setSelectedConcept(conceptItem.name)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-2 group ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/10 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/30'
                          : 'border-gray-200 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500 text-white font-bold'
                              : 'border-gray-400 text-transparent'
                          }`}>
                            ✓
                          </span>
                          <span className="text-xs font-bold truncate">{conceptItem.name}</span>
                        </div>
                        {conceptItem.subtopics && conceptItem.subtopics.length > 0 && (
                          <p className="text-[10px] text-gray-400 truncate pl-6">
                            {conceptItem.subtopics.slice(0, 3).join(' • ')}
                          </p>
                        )}
                      </div>

                      {conceptItem.importance && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-gray-200/60 dark:bg-dark-border text-gray-600 dark:text-gray-300 flex-shrink-0">
                          {conceptItem.importance}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 3: Question Count Selector (20 to 30) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-dark-border/60">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Step 3: Question Count (20 to 30)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setSelectedCount(cnt)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCount === cnt
                        ? 'bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {cnt} Qs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Step 4: Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Medium', 'Hard', 'Easy'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Step 5: Question Style
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="All">All Types (Theory, Output & Traps)</option>
                <option value="MCQ">Conceptual MCQ</option>
                <option value="Output Prediction">Code Output Prediction</option>
                <option value="SQL">SQL & Relational</option>
                <option value="Aptitude">Quantitative Aptitude</option>
              </select>
            </div>
          </div>

          {/* Launch Action */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Ready: Generating <strong className="text-brand-600 dark:text-brand-400 font-bold">{selectedCount} Questions</strong> exclusively on <strong className="text-gray-900 dark:text-white font-bold">{selectedConcept || 'Selected Concept'}</strong>
            </div>
            <button
              onClick={() => startConceptPractice(selectedSubject, selectedConcept, selectedCount)}
              disabled={generating || !selectedConcept}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {selectedCount} Questions on {selectedConcept || 'Concept'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE QUIZ ENGINE & PROGRESS MATRIX */}
      {/* ========================================================================= */}
      {generating ? (
        <div className="h-96 rounded-3xl bg-gray-50 dark:bg-dark-card border border-brand-500/20 flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 animate-pulse">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Gemini AI is generating {selectedCount} questions on "{selectedConcept}"...
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Building questions covering definitions, internal mechanisms, edge cases, and code tracing.
            </p>
          </div>
        </div>
      ) : quizCompleted ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-3xl">
            🏆
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {selectedConcept} Drill Completed!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You've answered all {questions.length} questions on <strong className="text-gray-700 dark:text-gray-200">{selectedConcept}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block font-bold uppercase">Score</span>
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono">
                {correctCount} / {questions.length}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border text-center min-w-[120px]">
              <span className="text-xs text-gray-400 block font-bold uppercase">Accuracy</span>
              <span className="text-2xl font-black text-emerald-500 font-mono">
                {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setQuizCompleted(false);
                jumpToQuestion(0);
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
            >
              Review Responses
            </button>
            <button
              onClick={() => startConceptPractice(selectedSubject, selectedConcept, selectedCount)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate Another {selectedCount} Qs on {selectedConcept}</span>
            </button>
            <button
              onClick={() => setShowStudio(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
            >
              <Target className="w-4 h-4" />
              <span>Choose a New Concept</span>
            </button>
          </div>
        </div>
      ) : !currentQ ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 space-y-4 shadow-sm">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No active practice set loaded</h3>
            <p className="text-xs text-gray-400 mt-1">Pick a concept and generate a full 20 to 30 question drill.</p>
          </div>
          <button
            onClick={() => setShowStudio(true)}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
          >
            <Target className="w-4 h-4" /> Open Concept Studio
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
          {/* Active Concept Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                🎯 {currentQ.topic || selectedConcept}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                {currentQ.subject || selectedSubject}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">
                {currentQ.difficulty}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {questions.length} Question Drill
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400 self-end sm:self-center">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" /> {seconds}s
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Interactive 20-30 Question Navigation Matrix */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
              <span>Question Navigation Matrix ({attemptedCount}/{questions.length} Answered)</span>
              <span>Score: {correctCount} Correct</span>
            </div>
            <div className="flex items-center gap-1.5 pb-2 overflow-x-auto scrollbar-thin">
              {questions.map((_, idx) => {
                const ans = answersHistory[idx];
                const isActive = idx === currentIndex;
                let bgStyle = 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 border-transparent';

                if (ans?.submitted) {
                  if (ans.isCorrect) {
                    bgStyle = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold';
                  } else {
                    bgStyle = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40 font-bold';
                  }
                }

                if (isActive) {
                  bgStyle += ' ring-2 ring-brand-500 font-black';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => jumpToQuestion(idx)}
                    className={`w-8 h-8 rounded-xl border text-xs flex items-center justify-center flex-shrink-0 transition-all ${bgStyle}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Statement */}
          <div className="space-y-3">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto border border-gray-800">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="space-y-3 pt-2">
            {(currentQ.options || []).map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              let optStyle = 'border-gray-200 dark:border-dark-border hover:border-brand-500/50 bg-gray-50/50 dark:bg-dark-surface/40';

              if (submitted) {
                if (opt === currentQ.correctAnswer) {
                  optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                } else if (isSelected && !result?.isCorrect) {
                  optStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold';
                } else {
                  optStyle = 'opacity-50 border-gray-200 dark:border-dark-border';
                }
              } else if (isSelected) {
                optStyle = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold shadow-sm';
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between ${optStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {submitted && opt === currentQ.correctAnswer && (
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                  {submitted && isSelected && !result?.isCorrect && (
                    <X className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & In-depth Concept Explanation */}
          {submitted && (
            <div
              className={`p-5 rounded-2xl border text-xs md:text-sm space-y-3 animate-in fade-in ${
                result?.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  {result?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Correct! +15 XP
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-500" /> Incorrect answer
                    </>
                  )}
                </span>

                {!result?.isCorrect && (
                  <button
                    onClick={handleAddToMistakes}
                    disabled={mistakeAdded}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      mistakeAdded
                        ? 'bg-gray-200 text-gray-500 cursor-default'
                        : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    {mistakeAdded ? 'Added to Mistake Book' : 'Add to Mistake Book'}
                  </button>
                )}
              </div>

              <p className="leading-relaxed font-sans">
                <strong className="block mb-1">Concept Explanation:</strong>
                {currentQ.explanation || 'Review the conceptual definition and boundary constraints.'}
              </p>
            </div>
          )}

          {/* Action Buttons & Pager */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
            <button
              onClick={() => jumpToQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-dark-surface flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {!submitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Complete Test <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeHub;
