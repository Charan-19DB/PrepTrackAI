import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  Compass,
  Star
} from 'lucide-react';
import api from '../api/axiosClient';

export const TopicExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subjectIdParam = searchParams.get('subjectId') || '';

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjectIdParam);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    subjectId: '',
    name: '',
    description: '',
    difficulty: 'Medium',
    importance: 'High'
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectIdParam) {
      setSelectedSubject(subjectIdParam);
    }
  }, [subjectIdParam]);

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject, selectedDifficulty, search]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
      if (!selectedSubject && res.data.length > 0 && !subjectIdParam) {
        // default can be all or first subject
      }
    } catch (err) {
      console.error('Error fetching subjects', err);
    }
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      let query = `/topics?`;
      if (selectedSubject) query += `subjectId=${selectedSubject}&`;
      if (selectedDifficulty !== 'All') query += `difficulty=${selectedDifficulty}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(query);
      setTopics(res.data);
    } catch (err) {
      console.error('Error fetching topics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const targetSubj = subjects.find(s => s._id === newTopic.subjectId);
      await api.post('/topics', {
        ...newTopic,
        subjectName: targetSubj?.name || 'Computer Science'
      });
      setShowAddModal(false);
      fetchTopics();
    } catch (err) {
      console.error('Error creating topic', err);
    }
  };

  const filteredTopics = selectedStatus === 'All'
    ? topics
    : topics.filter(t => t.status === selectedStatus);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Three-Layer Topic Explorer
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Topic Explorer & Syllabus
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Theory • Practical • Assessment • Interview Checklists
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics (e.g. BCNF, Sliding Window)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Subject dropdown */}
        <div>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSearchParams(e.target.value ? { subjectId: e.target.value } : {});
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
          >
            <option value="">All 22 Subjects</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
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
            <option value="Beginner">Beginner</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-semibold focus:outline-none"
          >
            <option value="All">All Learning Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="Learning">Learning</option>
            <option value="Practicing">Practicing</option>
            <option value="Completed">Completed</option>
            <option value="Needs Revision">Needs Revision</option>
            <option value="Mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Topics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-200 dark:bg-dark-card animate-pulse" />
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200">No topics match your filter</h3>
          <p className="text-xs text-gray-400 mt-1">Try clearing filters or search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <Link
              key={topic._id}
              to={`/topics/${topic._id}`}
              className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-5 shadow-sm hover:border-brand-500/50 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                    {topic.subjectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      topic.status === 'Mastered'
                        ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                        : topic.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : topic.status === 'Practicing'
                        ? 'bg-brand-500/10 text-brand-500 border border-brand-500/20'
                        : topic.status === 'Learning'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-gray-100 dark:bg-dark-surface text-gray-500'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {topic.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                  {topic.description || `Study and practice ${topic.name}.`}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-dark-border/60 mt-4">
                {/* Weighted progress bar */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Weighted Progress</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400">
                    {topic.progressPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${topic.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Custom Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Select Subject</label>
                <select
                  required
                  value={newTopic.subjectId}
                  onChange={(e) => setNewTopic({ ...newTopic, subjectId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                  placeholder="e.g. Distributed Consensus & Raft"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Difficulty</label>
                  <select
                    value={newTopic.difficulty}
                    onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Importance</label>
                  <select
                    value={newTopic.importance}
                    onChange={(e) => setNewTopic({ ...newTopic, importance: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Core">Core</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
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
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicExplorer;
