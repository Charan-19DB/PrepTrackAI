import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareCode,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Zap,
  Play
} from 'lucide-react';
import api from '../api/axiosClient';

const CATEGORIES = [
  'All', 'C', 'C++', 'Java', 'Python', 'OOP', 'DBMS', 'SQL',
  'OS', 'CN', 'AI', 'ML', 'DL', 'GenAI', 'Blockchain',
  'Web Development', 'Projects', 'HR'
];

export const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedDifficulty, search]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let query = `/interview/questions?`;
      if (selectedCategory !== 'All') query += `category=${selectedCategory}&`;
      if (selectedDifficulty !== 'All') query += `difficulty=${selectedDifficulty}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error fetching interview questions', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-purple-900 via-indigo-950 to-[#0F172A] border border-purple-500/20 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <MessageSquareCode className="w-4 h-4" /> Technical Interview Bank
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Interview Question Bank & Mock Simulator
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            17 categories with model answers, core points, and interactive AI evaluation
          </p>
        </div>

        <Link
          to="/interview/practice"
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-105 w-fit"
        >
          <Play className="w-4 h-4 fill-white" /> Start Practice Interview Mode
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interview questions..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Questions Accordion */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-dark-card rounded-2xl animate-pulse" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-xs">
          No questions found matching criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => {
            const isExpanded = expandedId === q._id;

            return (
              <div
                key={q._id}
                className="rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-dark-surface/40 transition-colors"
                >
                  <div className="space-y-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-brand-500/10 text-brand-500">
                        {q.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-500">
                        {q.difficulty}
                      </span>
                      {q.topic && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          • {q.topic}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                      {q.question}
                    </h3>
                  </div>

                  <div className="p-1 rounded-lg text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-gray-100 dark:border-dark-border/60 space-y-4 text-xs md:text-sm">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40 mt-4 space-y-2">
                      <span className="font-bold text-brand-600 dark:text-brand-400 uppercase text-xs tracking-wider block">
                        Model Answer:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {q.idealAnswer}
                      </p>
                    </div>

                    {q.keyPoints && q.keyPoints.length > 0 && (
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-2 text-xs">
                          Key Concepts Candidate Must Mention:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {q.keyPoints.map((pt, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                            >
                              ✓ {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2">
                      <Link
                        to={`/interview/practice?questionId=${q._id}`}
                        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" /> Practice Answering With AI
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
