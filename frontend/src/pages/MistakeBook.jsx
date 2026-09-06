import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Square,
  Search,
  RotateCcw,
  Sparkles,
  Trash2,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import api from '../api/axiosClient';

export const MistakeBook = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved'); // 'unresolved' | 'resolved' | 'all'
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMistakes();
  }, [filter, search]);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      let query = `/mistakes?`;
      if (filter === 'unresolved') query += `resolved=false&`;
      if (filter === 'resolved') query += `resolved=true&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      setMistakes(res.data);
    } catch (err) {
      console.error('Failed to load mistakes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResolve = async (id) => {
    try {
      await api.put(`/mistakes/${id}/resolve`);
      fetchMistakes();
    } catch (err) {
      console.error('Error toggling resolve', err);
    }
  };

  const handleDeleteMistake = async (id) => {
    try {
      await api.delete(`/mistakes/${id}`);
      fetchMistakes();
    } catch (err) {
      console.error('Error deleting mistake', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4" /> Cognitive Diagnostics
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Personal Mistake Book
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Never repeat the same error twice: catalog wrong answers, analyze root causes, and re-test
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['unresolved', 'resolved', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border'
              }`}
            >
              {tab} ({tab === 'unresolved' ? mistakes.filter(m => !m.resolved).length : mistakes.length})
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="relative bg-white dark:bg-dark-card p-3.5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        <Search className="w-4 h-4 absolute left-7 top-6 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mistakes by question or topic..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Mistakes List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-200 dark:bg-dark-card rounded-3xl" />)}
        </div>
      ) : mistakes.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No unresolved mistakes!</h3>
          <p className="mt-1">All cataloged mistakes have been understood and resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((m) => (
            <div
              key={m._id}
              className={`rounded-3xl p-6 border transition-all shadow-sm ${
                m.resolved
                  ? 'bg-gray-50/60 dark:bg-dark-card/40 border-gray-200 dark:border-dark-border/40 opacity-75'
                  : 'bg-white dark:bg-dark-card border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                      {m.subject} • {m.topic}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                      {m.difficulty}
                    </span>
                    {m.resolved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                        Resolved
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                    {m.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleResolve(m._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      m.resolved
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {m.resolved ? 'Resolved' : 'Mark Resolved'}
                  </button>
                  <button
                    onClick={() => handleDeleteMistake(m._id)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Answers comparison grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/20 text-xs">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">
                    ❌ What I Answered:
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono font-medium">
                    {m.myAnswer}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    ✓ Correct Answer:
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-mono font-medium">
                    {m.correctAnswer}
                  </span>
                </div>
              </div>

              {/* Root Cause / Why I was wrong */}
              {m.whyWrong && (
                <div className="mt-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40 text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">
                    💡 Why I Was Wrong (Root Cause Analysis):
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    "{m.whyWrong}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakeBook;
