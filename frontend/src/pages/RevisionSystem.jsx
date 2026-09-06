import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Star,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import api from '../api/axiosClient';

const STAGES = [
  { stage: 1, label: 'Stage 1 (+1 Day)' },
  { stage: 2, label: 'Stage 2 (+3 Days)' },
  { stage: 3, label: 'Stage 3 (+7 Days)' },
  { stage: 4, label: 'Stage 4 (+14 Days)' },
  { stage: 5, label: 'Stage 5 (+30 Days - Long Term)' },
];

export const RevisionSystem = () => {
  const [revisions, setRevisions] = useState([]);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRev, setNewRev] = useState({ subjectName: '', topicName: '', scheduledDate: '' });

  useEffect(() => {
    fetchRevisions();
  }, [filter]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const [allRes, todayRes] = await Promise.all([
        api.get(`/revisions?status=${filter}`),
        api.get('/revisions/today')
      ]);
      setRevisions(allRes.data);
      setTodayRevisions(todayRes.data);
    } catch (err) {
      console.error('Failed to load revisions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRevision = async (id, rating = 5) => {
    try {
      await api.put(`/revisions/${id}/complete`, { retentionRating: rating });
      fetchRevisions();
    } catch (err) {
      console.error('Error completing revision', err);
    }
  };

  const handleCreateRevision = async (e) => {
    e.preventDefault();
    try {
      await api.post('/revisions', newRev);
      setShowAddModal(false);
      setNewRev({ subjectName: '', topicName: '', scheduledDate: '' });
      fetchRevisions();
    } catch (err) {
      console.error('Error adding revision', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" /> Spaced Repetition Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Topic Revision System
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ebbinghaus forgetting curve optimizer (+1d, +3d, +7d, +14d, +30d intervals)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Schedule Revision
        </button>
      </div>

      {/* Due Today Banner */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Spaced Revisions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {todayRevisions.length} topics scheduled for review today to guarantee long-term retention
              </p>
            </div>
          </div>

          <span className="text-sm font-black text-amber-500">
            {todayRevisions.length} Due
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {todayRevisions.length === 0 ? (
            <p className="col-span-3 py-6 text-center text-xs text-gray-400 font-medium">
              No revisions due today! Excellent work staying on top of your schedule.
            </p>
          ) : (
            todayRevisions.map((rev) => (
              <div
                key={rev._id}
                className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
                    <span>{rev.subjectName}</span>
                    <span className="text-amber-500">Stage {rev.revisionStage}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {rev.topicName}
                  </h3>
                  {rev.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">
                      "{rev.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
                  <span className="text-[11px] text-gray-400 font-mono">
                    Due: {rev.scheduledDate}
                  </span>
                  <button
                    onClick={() => handleCompleteRevision(rev._id, 5)}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['Pending', 'Completed', 'All'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === status
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-dark-border'
              }`}
            >
              {status} Revisions
            </button>
          ))}
        </div>
      </div>

      {/* Full Revisions List */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl" />)}
          </div>
        ) : revisions.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400">
            No revisions in this filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
            {revisions.map((rev) => (
              <div
                key={rev._id}
                className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-dark-surface/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {rev.subjectName} — {rev.topicName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-brand-500/10 text-brand-500">
                      Stage {rev.revisionStage} of 5
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Scheduled date: {rev.scheduledDate} {rev.notes && `• "${rev.notes}"`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {rev.status === 'Completed' ? (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteRevision(rev._id, 5)}
                      className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Complete & Advance Stage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Revision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Schedule Custom Revision</h3>
            <form onSubmit={handleCreateRevision} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newRev.subjectName}
                  onChange={(e) => setNewRev({ ...newRev, subjectName: e.target.value })}
                  placeholder="e.g. Operating Systems"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={newRev.topicName}
                  onChange={(e) => setNewRev({ ...newRev, topicName: e.target.value })}
                  placeholder="e.g. Deadlocks"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  value={newRev.scheduledDate}
                  onChange={(e) => setNewRev({ ...newRev, scheduledDate: e.target.value })}
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
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionSystem;
