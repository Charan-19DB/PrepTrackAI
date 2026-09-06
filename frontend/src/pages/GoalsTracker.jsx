import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Trash2,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axiosClient';

export const GoalsTracker = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'DSA',
    targetValue: 50,
    unit: 'problems',
    deadline: '',
    dailyTarget: 3
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (goal) => {
    const nextVal = goal.currentValue + 1;
    try {
      await api.put(`/goals/${goal._id}`, { currentValue: nextVal });
      if (nextVal >= goal.targetValue) {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      }
      fetchGoals();
    } catch (err) {
      console.error('Error incrementing goal', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal', err);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', newGoal);
      setShowAddModal(false);
      setNewGoal({
        title: '',
        category: 'DSA',
        targetValue: 50,
        unit: 'problems',
        deadline: '',
        dailyTarget: 3
      });
      fetchGoals();
    } catch (err) {
      console.error('Error adding goal', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" /> Milestone Execution
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Preparation Goals & Targets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define high-impact milestones, track daily targets, and measure execution velocity
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-200 dark:bg-dark-card rounded-3xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8">
          No goals set. Create your first preparation target (e.g. "Solve 100 DSA Problems").
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

            return (
              <div
                key={goal._id}
                className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500 uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {goal.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>Target: {goal.targetValue} {goal.unit}</span>
                    <span>Deadline: {goal.deadline}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-dark-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500 dark:text-gray-400">
                      {goal.currentValue} / {goal.targetValue} ({percent}%)
                    </span>
                    <span className="text-brand-600 dark:text-brand-400">
                      Daily: {goal.dailyTarget} / day
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${percent >= 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${percent >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {goal.status}
                    </span>
                    {percent < 100 && (
                      <button
                        onClick={() => handleIncrement(goal)}
                        className="px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        +1 Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Set Preparation Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Master Dynamic Programming"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    required
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="problems, topics, hours"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Daily Target</label>
                  <input
                    type="number"
                    value={newGoal.dailyTarget}
                    onChange={(e) => setNewGoal({ ...newGoal, dailyTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTracker;
