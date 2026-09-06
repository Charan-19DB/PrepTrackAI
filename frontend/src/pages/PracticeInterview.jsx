import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquareCode,
  ArrowLeft,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Star,
  Send,
  Zap,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

const CATEGORIES = [
  'All', 'DBMS', 'OS', 'CN', 'Java', 'Python', 'OOP', 'GenAI', 'DSA', 'HR'
];

export const PracticeInterview = () => {
  const [searchParams] = useSearchParams();
  const initialQuestionId = searchParams.get('questionId') || '';

  const [category, setCategory] = useState('All');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    if (initialQuestionId) {
      loadSpecificQuestion(initialQuestionId);
    } else {
      loadRandomQuestion();
    }
  }, [category, initialQuestionId]);

  const loadSpecificQuestion = async (id) => {
    try {
      setLoading(true);
      const res = await api.get('/interview/questions');
      const found = res.data.find(q => q._id === id);
      if (found) {
        setCurrentQuestion(found);
      } else {
        loadRandomQuestion();
      }
    } catch (err) {
      console.error('Failed to load specific question', err);
      loadRandomQuestion();
    } finally {
      setLoading(false);
    }
  };

  const loadRandomQuestion = async () => {
    try {
      setLoading(true);
      setEvaluationResult(null);
      setUserAnswer('');
      const url = category === 'All' ? '/interview/random' : `/interview/random?category=${category}`;
      const res = await api.get(url);
      setCurrentQuestion(res.data);
    } catch (err) {
      console.error('Failed to load random question', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentQuestion) return;

    try {
      setEvaluating(true);
      const res = await api.post('/interview/evaluate', {
        questionId: currentQuestion._id,
        questionText: currentQuestion.question,
        idealAnswer: currentQuestion.idealAnswer,
        userAnswer
      });

      setEvaluationResult(res.data.evaluation);
      if (res.data.evaluation?.accuracyScore >= 4) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error('Failed to evaluate answer', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        to="/interview"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Question Bank
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Interactive Mock Simulator
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Practice Technical Interview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time evaluation of accuracy, completeness, and missing concepts
          </p>
        </div>

        {/* Category switcher */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Question Card */}
      {loading ? (
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
      ) : !currentQuestion ? (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No questions found in this category.</p>
          <button
            onClick={() => setCategory('All')}
            className="mt-3 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold"
          >
            Reset to All Categories
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500">
                {currentQuestion.category}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500">
                {currentQuestion.difficulty}
              </span>
            </div>

            <button
              onClick={loadRandomQuestion}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-500 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Skip / Next Question
            </button>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
            "{currentQuestion.question}"
          </h2>

          {/* Form */}
          <form onSubmit={handleEvaluateAnswer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                Your Answer (Type as you would speak in a placement interview):
              </label>
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={6}
                placeholder="Structure your answer: 1. Core definition, 2. How it works under the hood, 3. Real-world example & time/space tradeoffs..."
                className="w-full p-4 text-sm rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                type="submit"
                disabled={evaluating || !userAnswer.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
              >
                {evaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" /> Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit for Evaluation
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Evaluation Report */}
          {evaluationResult && (
            <div className="mt-8 p-6 rounded-3xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-500/30 space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200 dark:border-purple-800/40 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" /> AI Interview Assessment Report
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Evaluated against FAANG & top product company placement benchmarks
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block font-semibold">Accuracy</span>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {evaluationResult.accuracyScore} / 5
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block font-semibold">Completeness</span>
                    <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                      {evaluationResult.completenessScore} / 5
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block font-semibold">Confidence</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {evaluationResult.confidenceScore} / 5
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Interviewer Critique:</span>
                <p className="text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {evaluationResult.summaryFeedback}
                </p>
              </div>

              {/* Missing Points */}
              {evaluationResult.missingPoints && evaluationResult.missingPoints.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Concepts / Nuances You Missed:
                  </span>
                  <div className="space-y-1 pl-1">
                    {evaluationResult.missingPoints.map((pt, idx) => (
                      <div key={idx} className="text-xs text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Improvement */}
              {evaluationResult.suggestedImprovement && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-dark-card border border-purple-200 dark:border-purple-800/40 text-xs text-purple-800 dark:text-purple-200">
                  <strong className="block mb-0.5">Actionable Interview Tip:</strong>
                  {evaluationResult.suggestedImprovement}
                </div>
              )}

              {/* Model Ideal Answer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs space-y-1.5">
                <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px] block">
                  Model Answer Reference:
                </span>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {currentQuestion.idealAnswer}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={loadRandomQuestion}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  Practice Next Question →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeInterview;
