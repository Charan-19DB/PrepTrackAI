import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  CheckCircle2,
  Code2,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Square,
  PlusCircle,
  Calendar,
  Layers,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const { startTimer } = useTimer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/analytics')
      ]);
      setData(dashRes.data);
      setChartData(analyticsRes.data.dailyStudy || []);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentCompleted) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        isCompleted: !currentCompleted,
        status: !currentCompleted ? 'Completed' : 'Not Started'
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  const completeRevision = async (revId) => {
    try {
      await api.put(`/revisions/${revId}/complete`, { retentionRating: 5 });
      fetchDashboardData();
    } catch (err) {
      console.error('Error completing revision', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 dark:bg-dark-card rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-dark-card rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const todayTasks = data?.todayTasks || [];
  const todayRevisions = data?.todayRevisions || [];
  const weakTopics = data?.weakTopics || [];

  return (
    <div className="space-y-8">
      {/* Student Email Verification Reminder Banner */}
      {user && !user.isEmailVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-gray-900 dark:text-white">
                Student Account Email Verification Pending
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Verify your student identity ({user.email}) to unlock full placement analytics and official certificates.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Student Email
          </button>
        </div>
      )}

      {/* Hero / Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-brand-900 via-indigo-950 to-[#0F172A] border border-brand-500/20 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <span className="text-xs uppercase tracking-widest text-brand-300 font-bold">
                Student Preparation Command Center
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Good Morning, {user?.name || data?.user?.name || 'Student'}
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-xl">
              {data?.motivationalMessage || "Welcome! Start your first topic or study session today to build momentum."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
              <Flame className="w-7 h-7 text-orange-400 fill-orange-400 animate-bounce" />
              <div>
                <div className="text-xl md:text-2xl font-black">{data?.user?.streak?.currentStreak ?? 0} Days</div>
                <div className="text-[11px] text-gray-300 uppercase tracking-wider font-semibold">Study Streak</div>
              </div>
            </div>

            <Link
              to="/planner"
              className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> Daily Planner
            </Link>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards: 5 Cards (Today's Progress, Study Time, Topics Completed, DSA, Accuracy) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Today's Progress */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Progress</span>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.todayProgressPercentage ?? 0}%
            </div>
            {/* Visual mini-bar */}
            <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.todayProgressPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Study Time */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.totalStudyHoursFormatted || '0h 0m'}
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {metrics.todayStudyMinutes ?? 0} min logged today
            </p>
          </div>
        </div>

        {/* Topics Completed */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Topics Done</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.topicsCompleted ?? 0} <span className="text-sm text-gray-400 font-normal">/ {metrics.totalTopics || 0}</span>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              {metrics.overallCompletionPercentage ?? 0}% overall syllabus
            </p>
          </div>
        </div>

        {/* DSA Solved */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">DSA Problems</span>
            <Code2 className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.dsaSolvedCount ?? 0}
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">LeetCode & GFG</p>
          </div>
        </div>

        {/* Practice Accuracy */}
        <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.accuracyPercentage ?? 0}%
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">Diagnostic tier</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Plan (2 cols) & Right Column (Revise Today + Weak Areas) (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: TODAY'S LEARNING PLAN */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Learning Plan</h2>
                <p className="text-xs text-gray-400">Structured morning to evening CSE milestones</p>
              </div>
            </div>
            <Link
              to="/planner"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              Manage schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-dark-border/60">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No tasks scheduled for today. Click "Manage schedule" or generate an AI plan!
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task._id}
                  className="py-3.5 flex items-start justify-between gap-3 group transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task._id, task.isCompleted)}
                      className="mt-0.5 text-gray-400 hover:text-brand-500 transition-colors"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-brand-500" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            task.isCompleted
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {task.subject} — {task.topic}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400">
                          {task.timeSlot}
                        </span>
                      </div>
                      {task.subtopic && (
                        <p className="text-xs text-gray-400 mt-0.5">{task.subtopic}</p>
                      )}
                      {task.notes && (
                        <p className="text-[11px] text-brand-600/80 dark:text-brand-400/80 mt-1 italic">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.estimatedDuration}m
                    </span>
                    {!task.isCompleted && (
                      <button
                        onClick={() => startTimer(task.estimatedDuration)}
                        className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all text-xs font-semibold"
                        title="Start Pomodoro for this task"
                      >
                        Focus
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Revise Today & Weak Areas */}
        <div className="space-y-6">
          {/* REVISE TODAY (Spaced Repetition) */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Revise Today</h3>
              </div>
              <span className="text-xs font-semibold text-amber-500">
                {todayRevisions.length} due
              </span>
            </div>

            <div className="space-y-2.5">
              {todayRevisions.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">No spaced revisions due today!</p>
              ) : (
                todayRevisions.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/40 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {rev.subjectName} — {rev.topicName}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Interval Stage {rev.revisionStage} (Spaced Repetition)
                      </div>
                    </div>
                    <button
                      onClick={() => completeRevision(rev._id)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all"
                    >
                      Done
                    </button>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/revisions"
              className="block text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline pt-1"
            >
              View Spaced Repetition Schedule →
            </Link>
          </div>

          {/* WEAK AREAS & AI ADVISOR */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Weak Areas Detected</h3>
              </div>
              <span className="text-xs font-semibold text-rose-500">Action required</span>
            </div>

            <div className="space-y-3">
              {weakTopics.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800 dark:text-gray-200">
                      {item.topic} <span className="text-gray-400 font-normal">({item.subject})</span>
                    </span>
                    <span className="text-rose-500 font-bold">{item.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full"
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">{item.recommendation}</p>
                </div>
              ))}
            </div>

            <Link
              to="/mistakes"
              className="block text-center text-xs font-semibold text-rose-500 hover:underline pt-1"
            >
              Open Mistake Book ({metrics.pendingMistakesCount ?? 0} unresolved) →
            </Link>
          </div>
        </div>
      </div>

      {/* Activity / Study Hours Chart */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Weekly Activity & Study Time</h3>
              <p className="text-xs text-gray-400">Daily study hours trend over the past 14 days</p>
            </div>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Full Analytics →
          </Link>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} unit="h" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val} hours`, 'Study Duration']}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#studyHoursGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </div>
  );
};

export default Dashboard;
