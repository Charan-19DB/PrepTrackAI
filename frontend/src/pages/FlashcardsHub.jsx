import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Brain,
  Plus,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

export const FlashcardsHub = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // AI Generator Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('Operating Systems Deadlocks');
  const [genSubject, setGenSubject] = useState('Operating Systems');
  const [sessionCompleted, setSessionCompleted] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setSessionCompleted(false);
      // Try fetching due cards first
      let res = await api.get('/flashcards/due');
      if (!res.data || res.data.length === 0) {
        // Fallback to all cards
        res = await api.get('/flashcards');
      }
      setCards(res.data || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Failed to load flashcards', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating) => {
    if (!cards[currentIndex]) return;
    const cardId = cards[currentIndex]._id;

    try {
      await api.post(`/flashcards/${cardId}/review`, { rating });

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionCompleted(true);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  const handleGenerateCards = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.post('/flashcards/generate', {
        topic: genTopic,
        subject: genSubject,
        count: 5
      });
      setShowGenModal(false);
      fetchCards();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Generation failed', err);
    } finally {
      setGenerating(false);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4" /> Spaced Repetition Mastery
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            AI Flashcards Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            High-yield concept retention with SuperMemo SM-2 dynamic spacing intervals
          </p>
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all w-fit"
        >
          <Sparkles className="w-4 h-4" /> Generate Flashcards with AI
        </button>
      </div>

      {/* Main Flashcard Card */}
      {loading ? (
        <div className="h-80 rounded-3xl bg-gray-200 dark:bg-dark-card animate-pulse" />
      ) : sessionCompleted ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-2xl">
            🧠
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Flashcard Review Session Completed!
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              All cards in your active review queue have been scheduled according to their retention ease factor.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setSessionCompleted(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              Review Again
            </button>
            <button
              onClick={() => setShowGenModal(true)}
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md"
            >
              Generate More with AI
            </button>
          </div>
        </div>
      ) : !currentCard ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">No flashcards in your deck yet</h3>
          <p className="text-xs text-gray-400">Click below to generate high-yield placement flashcards using Gemini AI.</p>
          <button
            onClick={() => setShowGenModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md"
          >
            Generate First Deck with AI
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress & Deck Status Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-500" />
              {currentCard.subject} • {currentCard.topic}
            </span>
            <span>
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[320px] p-8 md:p-12 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:border-brand-500/50 shadow-xl cursor-pointer transition-all flex flex-col justify-between select-none relative group"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isFlipped
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              }`}>
                {isFlipped ? 'Answer / Concept Invariant' : 'Question / Concept Prompt'}
              </span>

              <span className="text-[11px] font-mono text-gray-400">
                Interval: {currentCard.intervalDays || 1}d
              </span>
            </div>

            <div className="py-6 my-auto text-center space-y-3">
              <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
            </div>

            <div className="text-center pt-4 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400 font-medium group-hover:text-brand-500 transition-colors">
              {isFlipped ? 'Click card to see question' : 'Click card to flip and reveal answer'}
            </div>
          </div>

          {/* SM-2 Spaced Repetition Rating Buttons */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-100 dark:border-dark-border space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Rate Your Recall (SuperMemo SM-2 Algorithm):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleReview('Again')}
                className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-700 hover:text-white dark:text-rose-400 font-bold text-xs transition-all text-center"
              >
                <span>Again</span>
                <span className="block text-[10px] opacity-75 font-normal">&lt; 1 Day</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('Hard')}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-white dark:text-amber-400 font-bold text-xs transition-all text-center"
              >
                <span>Hard</span>
                <span className="block text-[10px] opacity-75 font-normal">2 Days</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('Good')}
                className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500 text-blue-700 hover:text-white dark:text-blue-400 font-bold text-xs transition-all text-center"
              >
                <span>Good</span>
                <span className="block text-[10px] opacity-75 font-normal">4 Days</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('Easy')}
                className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-700 hover:text-white dark:text-emerald-400 font-bold text-xs transition-all text-center"
              >
                <span>Easy</span>
                <span className="block text-[10px] opacity-75 font-normal">7+ Days</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" /> AI Flashcard Generator
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateCards} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Normalization, Deadlocks, Sliding Window"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subject Category
                </label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="DBMS and SQL">DBMS and SQL</option>
                  <option value="Data Structures and Algorithms">Data Structures and Algorithms</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Java Programming">Java Programming</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-600 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  <span>{generating ? 'Generating Deck...' : 'Generate 5 Flashcards'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsHub;
