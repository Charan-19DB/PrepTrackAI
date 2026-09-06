import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Plus,
  Sparkles,
  Layers,
  Code2,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  Globe
} from 'lucide-react';
import api from '../api/axiosClient';

const CATEGORIES = [
  'All',
  'Core Computer Science',
  'Programming Languages',
  'Aptitude & Reasoning',
  'Artificial Intelligence',
  'Software & Systems',
  'Advanced Technologies'
];

export const Roadmap = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', category: 'Core Computer Science', description: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to load subjects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', newSubject);
      setShowAddModal(false);
      setNewSubject({ name: '', category: 'Core Computer Science', description: '' });
      fetchSubjects();
    } catch (err) {
      console.error('Failed to create subject', err);
    }
  };

  const filteredSubjects = selectedCategory === 'All'
    ? subjects
    : subjects.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Comprehensive CSE Roadmap
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Learning Roadmap & Curricula
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            22 full-scope subjects with 500+ structured placement topics
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-surface'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Subjects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <div
              key={sub._id}
              className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm hover:border-brand-500/40 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300">
                    {sub.category}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                      {sub.progressPercentage || 0}%
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {sub.description || `Comprehensive curriculum for ${sub.name}.`}
                </p>
              </div>

              <div className="pt-5 border-t border-gray-100 dark:border-dark-border/60 mt-4">
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 overflow-hidden mb-3">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${sub.progressPercentage || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {sub.completedTopicsCount || 0} / {sub.totalTopicsCount || 0} topics
                  </span>

                  <Link
                    to={`/topics?subjectId=${sub._id}`}
                    className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Explore Topics <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Custom Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                <select
                  value={newSubject.category}
                  onChange={(e) => setNewSubject({ ...newSubject, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  rows={3}
                  placeholder="What concepts does this subject cover?"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
