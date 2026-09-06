import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Square,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Timer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../api/axiosClient';
import { useTimer } from '../context/TimerContext';

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export const DailyPlanner = () => {
  const { startTimer } = useTimer();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiHours, setAiHours] = useState(3);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Add Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    subject: 'DBMS and SQL',
    topic: 'Normalization',
    subtopic: '',
    timeSlot: 'Morning',
    estimatedDuration: 45,
    difficulty: 'Medium',
    notes: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks?date=${selectedDate}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    try {
      await api.put(`/tasks/${task._id}`, {
        status: nextStatus,
        isCompleted: nextStatus === 'Completed'
      });
      fetchTasks();
    } catch (err) {
      console.error('Error toggling task', err);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        status,
        isCompleted: status === 'Completed'
      });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTask,
        date: selectedDate
      });
      setShowAddModal(false);
      setNewTask({
        subject: 'DBMS and SQL',
        topic: 'Normalization',
        subtopic: '',
        timeSlot: 'Morning',
        estimatedDuration: 45,
        difficulty: 'Medium',
        notes: ''
      });
      fetchTasks();
    } catch (err) {
      console.error('Error adding task', err);
    }
  };

  const handleGenerateAIPlan = async () => {
    try {
      setAiGenerating(true);
      await api.post('/tasks/generate-ai', { hoursAvailable: aiHours });
      setShowAIModal(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to generate AI plan', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.estimatedDuration || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" /> Daily Learning System
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Daily Study Schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} of {tasks.length} tasks completed ({Math.round((totalMinutes / 60) * 10) / 10}h planned)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Study Planner
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Date Navigator Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent font-extrabold text-sm md:text-base text-gray-900 dark:text-white focus:outline-none cursor-pointer"
          />
        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Time Slot Sections: Morning, Afternoon, Evening, Night */}
      <div className="space-y-6">
        {TIME_SLOTS.map((slot) => {
          const slotTasks = tasks.filter(t => t.timeSlot === slot);

          return (
            <div
              key={slot}
              className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-gray-900 dark:text-white">{slot}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-surface text-gray-500 font-semibold">
                    {slotTasks.length} {slotTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {slotTasks.reduce((a, b) => a + (b.estimatedDuration || 0), 0)} min total
                </span>
              </div>

              {slotTasks.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center italic">
                  No tasks scheduled for {slot.toLowerCase()}.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
                  {slotTasks.map((task) => (
                    <div
                      key={task._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="mt-1 flex-shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                task.isCompleted
                                  ? 'line-through text-gray-400 dark:text-gray-500'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {task.subject} — {task.topic}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                task.difficulty === 'Hard'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                  : task.difficulty === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              }`}
                            >
                              {task.difficulty}
                            </span>
                          </div>

                          {task.subtopic && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              Subtopic: {task.subtopic}
                            </p>
                          )}

                          {task.notes && (
                            <p className="text-xs text-gray-400 italic">
                              Note: {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right controls: Status selector, duration, timer trigger, delete */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task._id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-700 dark:text-gray-300 font-semibold focus:outline-none"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Skipped">Skipped</option>
                        </select>

                        <div className="flex items-center gap-1 text-xs font-mono text-gray-400 px-2 py-1 rounded-md bg-gray-100 dark:bg-dark-surface">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{task.estimatedDuration}m</span>
                        </div>

                        {!task.isCompleted && (
                          <button
                            onClick={() => startTimer(task.estimatedDuration)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
                            title="Start Pomodoro focus session"
                          >
                            <Timer className="w-3.5 h-3.5" /> Study
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Study Planner Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Study Planner</h3>
                <p className="text-xs text-gray-400">Generates optimal schedule based on weak topics</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                How many hours do you have to study today?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 6].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setAiHours(hrs)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      aiHours === hrs
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md'
                        : 'border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {hrs} Hours
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 dark:bg-dark-surface p-3 rounded-xl border border-gray-100 dark:border-dark-border">
                AI will inspect your weakest areas (Probability, OS Deadlocks, SQL Joins), upcoming revisions, and target role to compose a balanced plan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAIPlan}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Study Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  placeholder="e.g. DBMS and SQL"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={newTask.topic}
                  onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                  placeholder="e.g. Normalization"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Subtopic / Detail</label>
                <input
                  type="text"
                  value={newTask.subtopic}
                  onChange={(e) => setNewTask({ ...newTask, subtopic: e.target.value })}
                  placeholder="e.g. 3NF and BCNF"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Time Slot</label>
                  <select
                    value={newTask.timeSlot}
                    onChange={(e) => setNewTask({ ...newTask, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  >
                    {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newTask.estimatedDuration}
                    onChange={(e) => setNewTask({ ...newTask, estimatedDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPlanner;
