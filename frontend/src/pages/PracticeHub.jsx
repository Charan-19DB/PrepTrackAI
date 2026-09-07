import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookmarkPlus,
  BarChart2,
  Check,
  X,
  Plus,
  RefreshCw,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const PRACTICE_TYPES = ['All', 'MCQ', 'SQL', 'Aptitude', 'Output Prediction'];

export const PracticeHub = () => {
  const [selectedType, setSelectedType] = useState('All');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [mistakeAdded, setMistakeAdded] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    fetchQuestions(false);
    fetchStats();
  }, [selectedType]);

  useEffect(() => {
    let timer;
    if (!submitted && !quizCompleted) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [submitted, currentIndex, quizCompleted]);

  const fetchQuestions = async (forceFresh = false) => {
    try {
      setLoading(true);
      setQuizCompleted(false);
      const url = selectedType === 'All' 
        ? `/practice/questions?fresh=${forceFresh}` 
        : `/practice/questions?type=${selectedType}&fresh=${forceFresh}`;
      const res = await api.get(url);
      setQuestions(res.data);
      setCurrentIndex(0);
      setSelectedAnswer('');
      setSubmitted(false);
      setResult(null);
      setSeconds(0);
      setMistakeAdded(false);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  const generateFreshWithAI = async () => {
    try {
      setGenerating(true);
      setQuizCompleted(false);
      const res = await api.post('/practice/generate-fresh', {
        type: selectedType === 'All' ? 'All' : selectedType,
        count: 5
      });
      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setSelectedAnswer('');
        setSubmitted(false);
        setResult(null);
        setSeconds(0);
        setMistakeAdded(false);
      }
    } catch (err) {
      console.error('Failed to generate fresh questions', err);
    } finally {
      setGenerating(false);
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

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    const currentQ = questions[currentIndex];

    try {
      const res = await api.post('/practice/attempt', {
        questionId: currentQ._id,
        selectedAnswer,
        timeTakenSeconds: seconds
      });

      setResult(res.data);
      setSubmitted(true);
      if (res.data.isCorrect) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      }
      fetchStats();
    } catch (err) {
      console.error('Error submitting answer', err);
    }
  };

  const handleAddToMistakes = async () => {
    const currentQ = questions[currentIndex];
    try {
      await api.post('/mistakes', {
        questionId: currentQ._id,
        question: currentQ.question,
        myAnswer: selectedAnswer,
        correctAnswer: currentQ.correctAnswer,
        whyWrong: 'Missed conceptual corner-case during diagnostic quiz',
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
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setSubmitted(false);
      setResult(null);
      setSeconds(0);
      setMistakeAdded(false);
    } else {
      setQuizCompleted(true);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <CheckIcon className="w-4 h-4" /> Diagnostic & Practice Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Placement Practice & Quizzes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MCQs, SQL, Output prediction, Aptitude questions dynamically generated via Google Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Generator Button */}
          <button
            onClick={generateFreshWithAI}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
            title="Use Gemini API key to generate fresh questions"
          >
            <SparklesIcon className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating with Gemini...' : 'Generate Fresh AI Questions'}</span>
          </button>

          {stats && (
            <div className="hidden sm:flex items-center gap-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border px-4 py-2.5 rounded-2xl shadow-sm">
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Accuracy</span>
                <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                  {stats.overallAccuracy || 82}%
                </span>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-dark-border" />
              <div>
                <span className="text-xs text-gray-400 block font-medium">Attempts</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">
                  {stats.totalAttempts || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PRACTICE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === type
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Interactive Quiz Engine Card */}
      {loading || generating ? (
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse flex flex-col items-center justify-center p-8 text-center space-y-3">
          <SparklesIcon className="w-10 h-10 text-purple-500 animate-spin" />
          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {generating ? 'Gemini AI is crafting fresh placement questions...' : 'Loading questions...'}
          </p>
        </div>
      ) : quizCompleted ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
            🏆
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Practice Set Completed!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You've answered all {questions.length} questions in this round.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswer('');
                setSubmitted(false);
                setResult(null);
                setQuizCompleted(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
            >
              Review Set
            </button>
            <button
              onClick={generateFreshWithAI}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Generate Next Fresh Practice Set</span>
            </button>
          </div>
        </div>
      ) : !currentQ ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 space-y-4">
          <HelpIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">No questions found in this category</h3>
            <p className="text-xs text-gray-400 mt-1">Use the Gemini AI engine to generate fresh questions immediately.</p>
          </div>
          <button
            onClick={generateFreshWithAI}
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md inline-flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" /> Generate Questions with Gemini
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
          {/* Question Metadata bar */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                {currentQ.subject} • {currentQ.topic}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500">
                {currentQ.type}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">
                {currentQ.difficulty}
              </span>
              {currentQ.isCustom && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" /> AI Generated
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-gray-400" /> {seconds}s
              </span>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <span>
                Q {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          {/* Question Text */}
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

          {/* Options list */}
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
                optStyle = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between ${optStyle}`}
                >
                  <span>{opt}</span>
                  {submitted && opt === currentQ.correctAnswer && (
                    <CheckSimple className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                  {submitted && isSelected && !result?.isCorrect && (
                    <XSimple className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Explanation Box */}
          {submitted && (
            <div
              className={`p-5 rounded-2xl border text-xs md:text-sm space-y-3 ${
                result?.isCorrect
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  {result?.isCorrect ? (
                    <>
                      <CheckIcon className="w-5 h-5 text-emerald-500" /> Correct! +15 XP
                    </>
                  ) : (
                    <>
                      <AlertIcon className="w-5 h-5 text-rose-500" /> Incorrect answer
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
                    <BookmarkIcon className="w-3.5 h-3.5" />
                    {mistakeAdded ? 'Added to Mistake Book' : 'Add to Mistake Book'}
                  </button>
                )}
              </div>

              <p className="leading-relaxed font-sans">
                <strong className="block mb-1">Explanation:</strong>
                {currentQ.explanation || 'Review the conceptual definition and boundary constraints.'}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
            <span className="text-xs text-gray-400">
              {submitted ? 'Review explanation then proceed' : 'Select an option and submit'}
            </span>

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
                  Next Question <ArrowIcon className="w-4 h-4" />
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
