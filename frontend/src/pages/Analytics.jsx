import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Zap,
  Target
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend
} from 'recharts';
import api from '../api/axiosClient';

export const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-dark-card rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 dark:bg-dark-card rounded-3xl" />
          <div className="h-72 bg-gray-200 dark:bg-dark-card rounded-3xl" />
        </div>
      </div>
    );
  }

  const {
    readinessScore = 0,
    dailyStudy = [],
    weeklyStudy = [],
    subjectBreakdown = [],
    dsaByDifficulty = [],
    practiceAccuracy = [],
    heatmap = []
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header with Placement Readiness KPI */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-brand-900 via-indigo-950 to-[#0F172A] border border-brand-500/20 shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" /> Performance Analytics & Telemetry
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Preparation Analytics & Velocity
          </h1>
          <p className="text-sm text-gray-300 max-w-xl">
            Tracking study time, subject coverage, problem solving accuracy, and placement readiness
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center font-black text-2xl text-white shadow-lg">
            {readinessScore}%
          </div>
          <div>
            <div className="text-base font-extrabold text-white">Placement Readiness</div>
            <div className="text-xs text-brand-300 font-semibold">Tier 1 Target: 85%+</div>
          </div>
        </div>
      </div>

      {/* GitHub-style 365-day Contribution Heatmap */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Annual Consistency Heatmap (365 Days)</h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <span className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-dark-surface inline-block" />
              <span className="w-3 h-3 rounded-sm bg-brand-200 dark:bg-brand-900/60 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-brand-400 dark:bg-brand-700 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-brand-500 dark:bg-brand-500 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-brand-600 dark:bg-brand-400 inline-block" />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
            {heatmap.map((cell, idx) => {
              let bg = 'bg-gray-100 dark:bg-dark-surface';
              if (cell.count >= 5) bg = 'bg-brand-500 dark:bg-brand-400';
              else if (cell.count >= 3) bg = 'bg-brand-400 dark:bg-brand-600';
              else if (cell.count >= 1) bg = 'bg-brand-200 dark:bg-brand-900/70';

              return (
                <div
                  key={idx}
                  title={`${cell.date}: ${cell.count} learning activities`}
                  className={`w-3 h-3 rounded-sm ${bg} heatmap-cell cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 1: Daily Study Hours & Weekly Study Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Hours */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Daily Study Duration (Last 14 Days)
            </h3>
            <p className="text-xs text-gray-400">Hours spent studying via Pomodoro & focus sessions</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyStudy}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} unit="h" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} hrs`, 'Study Time']}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Study vs Target */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" /> Weekly Hours vs Target (15h Target)
            </h3>
            <p className="text-xs text-gray-400">Consistency benchmark across consecutive weeks</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudy}>
                <XAxis dataKey="week" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} unit="h" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} name="Actual Hours" />
                <Bar dataKey="target" fill="#10b981" fillOpacity={0.3} radius={[8, 8, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Subject Completion Breakdown & Practice Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Completion Progress */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Subject Syllabus Progress</h3>
            <p className="text-xs text-gray-400">Top CSE subjects by completion percentage</p>
          </div>

          <div className="space-y-3 pt-2">
            {subjectBreakdown.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">{s.subject}</span>
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {s.completedTopics} / {s.totalTopics} ({s.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Accuracy by Domain */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">Assessment Accuracy by Domain</h3>
            <p className="text-xs text-gray-400">Diagnostic accuracy across practice categories</p>
          </div>

          <div className="space-y-3 pt-2">
            {practiceAccuracy.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-800 dark:text-gray-200">{cat.category}</span>
                  <span className={`font-bold ${cat.accuracy >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {cat.accuracy}% Accuracy
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${cat.accuracy >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${cat.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
