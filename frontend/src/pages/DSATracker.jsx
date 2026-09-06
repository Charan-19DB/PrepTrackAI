import React, { useState, useEffect } from 'react';
import {
  Code2,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  Trash2,
  Star,
  Check
} from 'lucide-react';
import api from '../api/axiosClient';

const CATEGORIES = [
  'All',
  'Arrays',
  'Strings',
  'Hashing',
  'Linked List',
  'Stack',
  'Queue',
  'Binary Search',
  'Trees',
  'Graphs',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Dynamic Programming',
  'Two Pointer',
  'Sliding Window'
];

export const DSATracker = () => {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [onlyRevisit, setOnlyRevisit] = useState(false);
  const [search, setSearch] = useState('');

  // Add Problem Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: '',
    platform: 'LeetCode',
    url: '',
    difficulty: 'Medium',
    category: 'Arrays',
    status: 'Solved',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    solutionNotes: '',
    revisitRequired: false
  });

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [selectedCategory, selectedDifficulty, selectedStatus, onlyRevisit, search]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      let query = `/dsa?`;
      if (selectedCategory !== 'All') query += `category=${selectedCategory}&`;
      if (selectedDifficulty !== 'All') query += `difficulty=${selectedDifficulty}&`;
      if (selectedStatus !== 'All') query += `status=${selectedStatus}&`;
      if (onlyRevisit) query += `revisit=true&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      setProblems(res.data);
    } catch (err) {
      console.error('Failed to load DSA problems', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dsa/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load DSA stats', err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/dsa/${id}`, { status });
      fetchProblems();
      fetchStats();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleToggleRevisit = async (problem) => {
    try {
      await api.put(`/dsa/${problem._id}`, {
        revisitRequired: !problem.revisitRequired
      });
      fetchProblems();
      fetchStats();
    } catch (err) {
      console.error('Error updating revisit', err);
    }
  };

  const handleDeleteProblem = async (id) => {
    try {
      await api.delete(`/dsa/${id}`);
      fetchProblems();
      fetchStats();
    } catch (err) {
      console.error('Error deleting problem', err);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dsa', newProblem);
      setShowAddModal(false);
      setNewProblem({
        title: '',
        platform: 'LeetCode',
        url: '',
        difficulty: 'Medium',
        category: 'Arrays',
        status: 'Solved',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        solutionNotes: '',
        revisitRequired: false
      });
      fetchProblems();
      fetchStats();
    } catch (err) {
      console.error('Error creating problem', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Code2 className="w-4 h-4" /> Algorithmic Problem Solving
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            DSA Tracker & Solved Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track LeetCode & GFG progress with revision tags, complex patterns, and complexity bounds
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Add Problem
        </button>
      </div>

      {/* Quick Stats Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
            <span className="text-xs text-gray-400 font-medium">Total Solved</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {stats.solvedCount || 54}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
            <span className="text-xs text-emerald-500 font-bold">Easy Solved</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.byDifficulty?.Easy || 24}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
            <span className="text-xs text-amber-500 font-bold">Medium Solved</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.byDifficulty?.Medium || 22}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
            <span className="text-xs text-rose-500 font-bold">Hard Solved</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {stats.byDifficulty?.Hard || 8}
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems (e.g. Two Sum, Substring)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Revisit Toggle */}
        <button
          onClick={() => setOnlyRevisit(!onlyRevisit)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
            onlyRevisit
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
              : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Revisit Needed
        </button>
      </div>

      {/* Problems Table / Cards */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl" />)}
          </div>
        ) : problems.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            No DSA problems match your filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
            {problems.map((prob) => (
              <div
                key={prob._id}
                className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-dark-surface/40 transition-colors group"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={prob.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-gray-900 dark:text-white hover:text-brand-500 transition-colors flex items-center gap-1.5"
                    >
                      {prob.title}
                      {prob.url && <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-500" />}
                    </a>

                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400">
                      {prob.platform}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        prob.difficulty === 'Hard'
                          ? 'bg-rose-500/10 text-rose-500'
                          : prob.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {prob.difficulty}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-500/10 text-purple-500">
                      {prob.category}
                    </span>
                  </div>

                  {prob.solutionNotes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl font-mono">
                      💡 {prob.solutionNotes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                    {prob.timeComplexity && <span>Time: {prob.timeComplexity}</span>}
                    {prob.spaceComplexity && <span>• Space: {prob.spaceComplexity}</span>}
                    <span>• {prob.attempts || 1} attempts</span>
                  </div>
                </div>

                {/* Right side controls */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleToggleRevisit(prob)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                      prob.revisitRequired
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'border-gray-200 dark:border-dark-border text-gray-400 hover:text-amber-500'
                    }`}
                    title="Toggle Revisit flag"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {prob.revisitRequired ? 'Revisit' : 'Mark Revisit'}
                  </button>

                  <select
                    value={prob.status}
                    onChange={(e) => handleUpdateStatus(prob._id, e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Solved">Solved</option>
                    <option value="Revisit">Revisit</option>
                    <option value="Mastered">Mastered</option>
                  </select>

                  <button
                    onClick={() => handleDeleteProblem(prob._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Delete problem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Problem Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add DSA Problem</h3>
            <form onSubmit={handleCreateProblem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={newProblem.title}
                  onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                  placeholder="e.g. Trapping Rain Water"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Platform</label>
                  <select
                    value={newProblem.platform}
                    onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="CodeStudio">CodeStudio</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Difficulty</label>
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <select
                    value={newProblem.category}
                    onChange={(e) => setNewProblem({ ...newProblem, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={newProblem.status}
                    onChange={(e) => setNewProblem({ ...newProblem, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Solved">Solved</option>
                    <option value="Attempted">Attempted</option>
                    <option value="Mastered">Mastered</option>
                    <option value="Revisit">Revisit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Problem URL</label>
                <input
                  type="url"
                  value={newProblem.url}
                  onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Time Complexity</label>
                  <input
                    type="text"
                    value={newProblem.timeComplexity}
                    onChange={(e) => setNewProblem({ ...newProblem, timeComplexity: e.target.value })}
                    placeholder="e.g. O(N log N)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Space Complexity</label>
                  <input
                    type="text"
                    value={newProblem.spaceComplexity}
                    onChange={(e) => setNewProblem({ ...newProblem, spaceComplexity: e.target.value })}
                    placeholder="e.g. O(1)"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Core Pattern / Notes</label>
                <textarea
                  value={newProblem.solutionNotes}
                  onChange={(e) => setNewProblem({ ...newProblem, solutionNotes: e.target.value })}
                  rows={2}
                  placeholder="Two pointer inward scan with leftMax and rightMax tracking..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  Add Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSATracker;
