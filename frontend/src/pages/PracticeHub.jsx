import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookMarked,
  ArrowRight,
  Sliders,
  AlertCircle,
  X,
  Layers,
  HelpCircle,
  Filter,
  Zap,
  Target,
  BookOpen,
  Search,
  CheckSquare,
  Square,
  ExternalLink,
  Globe,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';
import TeachMeAgainModal from '../components/common/TeachMeAgainModal';

const Youtube = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const ALL_22_SUBJECTS = [
  { name: 'Operating Systems', category: 'Core CS' },
  { name: 'DBMS and SQL', category: 'Core CS' },
  { name: 'Computer Networks', category: 'Core CS' },
  { name: 'Data Structures and Algorithms', category: 'Core CS' },
  { name: 'OOP', category: 'Core CS' },
  { name: 'Python Programming', category: 'Programming' },
  { name: 'Java Programming', category: 'Programming' },
  { name: 'C Programming', category: 'Programming' },
  { name: 'Quantitative Aptitude', category: 'Aptitude & Reasoning' },
  { name: 'Logical Reasoning', category: 'Aptitude & Reasoning' },
  { name: 'Verbal Ability', category: 'Aptitude & Reasoning' },
  { name: 'AI and Machine Learning', category: 'AI & Data' },
  { name: 'Deep Learning', category: 'AI & Data' },
  { name: 'Generative AI', category: 'AI & Data' },
  { name: 'RAG', category: 'AI & Data' },
  { name: 'AI Agents', category: 'AI & Data' },
  { name: 'Fine Tuning', category: 'AI & Data' },
  { name: 'Web Development', category: 'Engineering' },
  { name: 'Software Engineering', category: 'Engineering' },
  { name: 'Cloud, DevOps and Tools', category: 'Engineering' },
  { name: 'Cybersecurity', category: 'Engineering' },
  { name: 'Blockchain', category: 'Engineering' }
];

const QUESTION_COUNTS = [20, 25, 30];

/**
 * Helper to dynamically suggest top verified educational YouTube channels & webpages for any concept
 */
export const getSuggestionsForConcept = (subject = '', topic = '') => {
  const subj = (subject || '').toLowerCase();
  const top = topic || subject || 'Fundamentals';

  let channel = 'Gate Smashers';
  let channelUrl = 'https://www.youtube.com/@GateSmashers';
  let webSource = 'GeeksforGeeks';

  if (subj.includes('dsa') || subj.includes('algorithm') || subj.includes('data structure')) {
    channel = 'take U forward (Striver)';
    channelUrl = 'https://www.youtube.com/@takeUforward';
    webSource = 'LeetCode / GeeksforGeeks';
  } else if (subj.includes('dbms') || subj.includes('sql') || subj.includes('database')) {
    channel = 'Gate Smashers / Alex The Analyst';
    channelUrl = 'https://www.youtube.com/@GateSmashers';
    webSource = 'W3Schools SQL / GeeksforGeeks';
  } else if (subj.includes('network') || subj.includes('cn')) {
    channel = 'NetworkChuck';
    channelUrl = 'https://www.youtube.com/@NetworkChuck';
    webSource = 'GeeksforGeeks Computer Networks';
  } else if (subj.includes('os') || subj.includes('operating')) {
    channel = 'Gate Smashers (Varun Singla)';
    channelUrl = 'https://www.youtube.com/@GateSmashers';
    webSource = 'GeeksforGeeks Operating Systems';
  } else if (subj.includes('system design') || subj.includes('distributed')) {
    channel = 'ByteByteGo (Alex Xu)';
    channelUrl = 'https://www.youtube.com/@ByteByteGo';
    webSource = 'System Design Primer (GitHub)';
  } else if (subj.includes('aptitude') || subj.includes('reasoning') || subj.includes('verbal')) {
    channel = 'CareerRide / Feel Free to Learn';
    channelUrl = 'https://www.youtube.com/@CareerRide';
    webSource = 'IndiaBIX Aptitude & Reasoning';
  } else if (subj.includes('web') || subj.includes('react') || subj.includes('javascript')) {
    channel = 'Web Dev Simplified';
    channelUrl = 'https://www.youtube.com/@WebDevSimplified';
    webSource = 'MDN Web Docs';
  } else if (subj.includes('python')) {
    channel = 'Chai aur Code / freeCodeCamp';
    channelUrl = 'https://www.youtube.com/@chaiaurcode';
    webSource = 'Real Python / W3Schools';
  } else if (subj.includes('java')) {
    channel = 'Kunal Kushwaha';
    channelUrl = 'https://www.youtube.com/@KunalKushwaha';
    webSource = 'Baeldung on Java';
  } else if (subj.includes('ai') || subj.includes('machine learning') || subj.includes('deep learning')) {
    channel = 'StatQuest with Josh Starmer';
    channelUrl = 'https://www.youtube.com/@statquest';
    webSource = 'DeepLearning.AI / Scikit-Learn Docs';
  } else if (subj.includes('cloud') || subj.includes('devops')) {
    channel = 'TechWorld with Nana';
    channelUrl = 'https://www.youtube.com/@TechWorldwithNana';
    webSource = 'Kubernetes & Docker Official Docs';
  }

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} ${top} lecture ${channel}`)}`;
  const webSearchUrl = `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(`${subject} ${top}`)}`;

  return {
    channel,
    channelUrl,
    webSource,
    youtubeUrl: youtubeSearchUrl,
    webUrl: webSearchUrl
  };
};

export const PracticeHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || 'Operating Systems';

  // Multi-Subject Studio Selection State
  const [showStudio, setShowStudio] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([initialSubject]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedCount, setSelectedCount] = useState(25);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedType, setSelectedType] = useState('All');

  // Teach Me Again Modal State
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [teachModalSubject, setTeachModalSubject] = useState('Operating Systems');
  const [teachModalTopic, setTeachModalTopic] = useState('Deadlocks');

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

  useEffect(() => {
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

  const fetchStats = async () => {
    try {
      const res = await api.get('/practice/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load practice stats', err);
    }
  };

  // Toggle individual subject in multi-select array
  const toggleSubject = (name) => {
    setSelectedSubjects(prev => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(s => s !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  // Quick preset handlers
  const handleSelectAll = () => {
    setSelectedSubjects(ALL_22_SUBJECTS.map(s => s.name));
  };

  const handleClearToDefault = () => {
    setSelectedSubjects(['Operating Systems']);
  };

  const handleSelectPreset = (categoryName) => {
    const matching = ALL_22_SUBJECTS.filter(s => s.category === categoryName).map(s => s.name);
    if (matching.length > 0) {
      setSelectedSubjects(matching);
    }
  };

  const openTeachModal = (subj, top) => {
    setTeachModalSubject(subj || 'Operating Systems');
    setTeachModalTopic(top || 'Deadlocks');
    setTeachModalOpen(true);
  };

  const startMultiSubjectPractice = async () => {
    if (selectedSubjects.length === 0) {
      setErrorMessage('Please select at least one subject to practice.');
      return;
    }

    try {
      setGenerating(true);
      setErrorMessage('');
      setQuizCompleted(false);
      setAnswersHistory({});

      const res = await api.post('/practice/generate-fresh', {
        subjects: selectedSubjects,
        count: selectedCount,
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
      } else {
        setErrorMessage('Could not generate questions. Please try again.');
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
        whyWrong: `Missed during ${currentQ.subject} practice set`,
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

  // Filter subjects in search
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return ALL_22_SUBJECTS;
    const q = subjectSearch.toLowerCase();
    return ALL_22_SUBJECTS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [subjectSearch]);

  const currentQ = questions.length > 0 ? questions[currentIndex] : null;
  const currentSuggestion = currentQ ? getSuggestionsForConcept(currentQ.subject, currentQ.topic) : null;
  const correctCount = Object.values(answersHistory).filter(a => a.isCorrect).length;
  const attemptedCount = Object.keys(answersHistory).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Practice Hub & Subject Mastery Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Placement Practice & Quizzes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select one or multiple subjects from all 22 CSE subjects and generate 20 to 30 targeted questions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Link to YouTube Channels & Web Docs */}
          <Link
            to="/resources"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-all shadow-sm"
          >
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>📺 Video Channels & Docs</span>
          </Link>

          <button
            onClick={() => setShowStudio(prev => !prev)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>{showStudio ? 'Hide Subject Picker' : '🎯 Choose Subjects (20–30 Qs)'}</span>
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
      {/* MULTI-SUBJECT SELECTION STUDIO (ALL 22 SUBJECTS) */}
      {/* ========================================================================= */}
      {showStudio && (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-brand-500/30 p-6 md:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border/60 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-500" />
                Select Subjects & Question Volume (20 to 30 Questions)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Choose one or multiple subjects from all 22 subjects. Questions will be generated exclusively across your selection.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-bold text-xs">
                {selectedSubjects.length} of 22 Selected
              </span>
            </div>
          </div>

          {/* STEP 1: Choose Subject(s) (Multi-Select across all 22 Subjects) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                Step 1: Choose Subject(s) — Click to Toggle Multiple
              </label>

              {/* Quick Presets & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-[11px] font-bold"
                >
                  Select All 22
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Core CS')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold"
                >
                  Core CS (5)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Programming')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold"
                >
                  Programming (3)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('Aptitude & Reasoning')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-bold"
                >
                  Aptitude (3)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('AI & Data')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-[11px] font-bold"
                >
                  AI & Modern (6)
                </button>
                <button
                  type="button"
                  onClick={handleClearToDefault}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500 text-[11px] font-bold"
                >
                  Reset
                </button>

                <div className="relative w-full sm:w-56 mt-2 sm:mt-0">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Search 22 subjects..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 22 Subjects Multiple Choice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredSubjects.map((subj) => {
                const isSelected = selectedSubjects.includes(subj.name);
                return (
                  <button
                    key={subj.name}
                    type="button"
                    onClick={() => toggleSubject(subj.name)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/30 shadow-sm'
                        : 'border-gray-200 dark:border-dark-border hover:border-brand-500/40 bg-gray-50/50 dark:bg-dark-surface/40 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white font-bold'
                          : 'border-gray-400 text-transparent'
                      }`}>
                        ✓
                      </div>
                      <span className="text-xs font-bold truncate">{subj.name}</span>
                    </div>

                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-gray-200/60 dark:bg-dark-border text-gray-600 dark:text-gray-300 flex-shrink-0">
                      {subj.category}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SUGGESTED YOUTUBE CHANNELS & WEBPAGES FOR SELECTED SUBJECTS */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/5 via-indigo-500/5 to-purple-500/5 border border-rose-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                  <Youtube className="w-4 h-4 text-rose-500" />
                  <span>Suggested YouTube Channels & Web Docs for Selected Subjects:</span>
                </div>
                <Link
                  to="/resources"
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Resource Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {selectedSubjects.slice(0, 4).map((s) => {
                  const sugg = getSuggestionsForConcept(s, '');
                  return (
                    <div
                      key={s}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs flex items-center gap-2.5 shadow-sm flex-shrink-0"
                    >
                      <div>
                        <div className="font-bold text-gray-800 dark:text-gray-200 text-[11px] truncate max-w-[130px]">
                          {s}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span>{sugg.channel}</span>
                        </div>
                      </div>

                      <a
                        href={sugg.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <Youtube className="w-2.5 h-2.5" />
                        <span>Watch</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2, 3, 4: Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-dark-border/60">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">
                Step 2: Question Count (20 to 30)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
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
                Step 3: Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Medium', 'Hard', 'Easy'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
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
                Step 4: Question Style
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
              Generating <strong className="text-brand-600 dark:text-brand-400 font-bold">{selectedCount} Questions</strong> across <strong className="text-gray-900 dark:text-white font-bold">{selectedSubjects.length} Subject{selectedSubjects.length > 1 ? 's' : ''}</strong> ({selectedSubjects.slice(0, 3).join(', ')}{selectedSubjects.length > 3 ? ` +${selectedSubjects.length - 3} more` : ''})
            </div>
            <button
              onClick={startMultiSubjectPractice}
              disabled={generating || selectedSubjects.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate {selectedCount} Questions on {selectedSubjects.length > 1 ? `${selectedSubjects.length} Subjects` : selectedSubjects[0]}</span>
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
              Gemini AI is generating {selectedCount} questions across {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''}...
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Targeting: {selectedSubjects.join(', ')}.
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
              Practice Drill Completed!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You've answered all {questions.length} questions across <strong className="text-gray-700 dark:text-gray-200">{selectedSubjects.join(', ')}</strong>.
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

          {/* SUGGESTIONS ON COMPLETION SCREEN */}
          <div className="p-5 rounded-3xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border max-w-2xl mx-auto text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Suggested Webpages & YouTube Channels to Revise:</span>
              </div>
              <Link to="/resources" className="text-xs font-bold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedSubjects.map(s => {
                const sugg = getSuggestionsForConcept(s, '');
                return (
                  <div key={s} className="p-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{s}</div>
                      <div className="text-[10px] text-gray-400">{sugg.channel}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={sugg.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        title="Watch Lecture on YouTube"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={sugg.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        title="Read GeeksforGeeks Article"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
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
              onClick={startMultiSubjectPractice}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate Another {selectedCount} Qs</span>
            </button>
            <button
              onClick={() => setShowStudio(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
            >
              <Target className="w-4 h-4" />
              <span>Choose Other Subjects</span>
            </button>
          </div>
        </div>
      ) : !currentQ ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 space-y-4 shadow-sm">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No active practice set loaded</h3>
            <p className="text-xs text-gray-400 mt-1">Select subjects from all 22 subjects above and generate a 20 to 30 question drill.</p>
          </div>
          <button
            onClick={() => setShowStudio(true)}
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
          >
            <Target className="w-4 h-4" /> Open Subject Studio
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
          {/* Active Quiz Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-dark-border pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                📚 {currentQ.subject || 'Computer Science'}
              </span>
              {currentQ.topic && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                  {currentQ.topic}
                </span>
              )}
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

          {/* Question Navigation Matrix */}
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
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono border flex items-center justify-center flex-shrink-0 transition-all ${bgStyle}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUGGESTED LEARNING STRIP FOR ACTIVE QUESTION */}
          {currentSuggestion && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-rose-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Suggestions to learn <span className="text-purple-600 dark:text-purple-400 underline">{currentQ.topic || currentQ.subject}</span>:
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={currentSuggestion.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-all"
                  title={`Search video lectures on YouTube by ${currentSuggestion.channel}`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>Watch {currentSuggestion.channel}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={currentSuggestion.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-sm transition-all"
                  title={`Search article on ${currentSuggestion.webSource}`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Read {currentSuggestion.webSource}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => openTeachModal(currentQ.subject, currentQ.topic || currentQ.subject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-sm transition-all"
                  title="Generate plain-English analogy, code trace, common pitfalls, and 8-step roadmap"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>✨ Teach Me Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Question Body */}
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-2xl bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto border border-gray-800 leading-relaxed">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options?.map((opt, i) => {
              const optLetter = ['A', 'B', 'C', 'D'][i] || String(i + 1);
              const isSelected = selectedAnswer === opt;
              let btnStyle = 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-gray-800 dark:text-gray-200 hover:border-brand-500/50';

              if (submitted) {
                const isCorrectOpt = String(opt).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
                if (isCorrectOpt) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30';
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30';
                } else {
                  btnStyle = 'opacity-50 border-gray-200 dark:border-dark-border';
                }
              } else if (isSelected) {
                btnStyle = 'border-brand-500 bg-brand-500/10 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/30 font-bold';
              }

              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-dark-card border border-inherit flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {optLetter}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {submitted && (
            <div className={`p-5 rounded-3xl border space-y-4 animate-in fade-in ${
              result?.isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result?.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span>Incorrect. Correct answer is: {currentQ.correctAnswer}</span>
                    </>
                  )}
                </div>

                {!result?.isCorrect && (
                  <button
                    onClick={handleAddToMistakes}
                    disabled={mistakeAdded}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-dark-card text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-900 shadow-sm transition-all disabled:opacity-50"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>{mistakeAdded ? 'Added to Mistakes' : 'Add to Mistake Book'}</span>
                  </button>
                )}
              </div>

              <div className="text-xs leading-relaxed opacity-90 pl-7">
                <strong>Technical Explanation: </strong>
                {result?.explanation || currentQ.explanation || 'Detailed answer logic based on CSE placement principles.'}
              </div>

              {/* RECOMMENDED RESOURCES IN EXPLANATION */}
              {currentSuggestion && (
                <div className="pt-3 border-t border-inherit/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <span className="font-bold flex items-center gap-1.5 opacity-90">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    Recommended Suggestions to Master this Concept:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={currentSuggestion.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>{currentSuggestion.channel} Video ↗</span>
                    </a>
                    <span className="opacity-40">•</span>
                    <a
                      href={currentSuggestion.webUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{currentSuggestion.webSource} Article ↗</span>
                    </a>
                    <span className="opacity-40">•</span>
                    <button
                      type="button"
                      onClick={() => openTeachModal(currentQ.subject, currentQ.topic || currentQ.subject)}
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Analogy & Roadmap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
            <button
              onClick={() => jumpToQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-surface disabled:opacity-30"
            >
              Previous
            </button>

            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish Drill' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Teach Me Again AI Pedagogical Modal */}
      <TeachMeAgainModal
        isOpen={teachModalOpen}
        onClose={() => setTeachModalOpen(false)}
        initialSubject={teachModalSubject}
        initialTopic={teachModalTopic}
      />
    </div>
  );
};

export default PracticeHub;
