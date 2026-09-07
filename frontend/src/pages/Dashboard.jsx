import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Calendar,
  Layers,
  ShieldCheck,
  Mic,
  Headset,
  Building2,
  Video,
  Award,
  Target,
  Zap,
  HelpCircle,
  AlertCircle,
  Play
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
import TeachMeAgainModal from '../components/common/TeachMeAgainModal';

export const Dashboard = () => {
  const { user } = useAuth();
  const { startTimer } = useTimer();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedWeakTopicInfo, setSelectedWeakTopicInfo] = useState(null);
  const [teachModalOpen, setTeachModalOpen] = useState(false);
  const [teachModalSubject, setTeachModalSubject] = useState('Operating Systems');
  const [teachModalTopic, setTeachModalTopic] = useState('Deadlocks');

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
        <div className="h-32 bg-gray-200 dark:bg-dark-card rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-dark-card rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const todayTasks = data?.todayTasks || [];
  const todayRevisions = data?.todayRevisions || [];
  const weakTopics = data?.weakTopics || [];
  const placementReadiness = data?.placementReadiness || {
    overallScore: 52,
    targetTier: 'Product / Services Tier 2',
    categoryRatings: {
      dsa: 45,
      csFundamentals: 60,
      systemDesign: 40,
      mockInterview: 50,
      aptitude: 65,
      communication: 55
    },
    bottleneck: 'DSA medium problem consistency',
    actionableRecommendations: ['Solve 2 medium problems daily', 'Practice verbal system design trade-offs']
  };
  const todayPrioritySchedule = data?.todayPrioritySchedule || [];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Student Email Verification Reminder Banner */}
      {user && !user.isEmailVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-gray-900 dark:text-white">
                Student Account Email Verification Pending
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-[11px] sm:text-xs">
                Verify your student identity ({user.email}) to unlock full placement analytics and official certificates.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowVerifyModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Student Email
          </button>
        </div>
      )}

      {/* Hero / Greeting Card with Streak */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8 bg-gradient-to-r from-brand-900 via-indigo-950 to-[#0F172A] border border-brand-500/20 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">👋</span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-brand-300 font-bold">
                Student Preparation Command Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              Good Day, {user?.name || data?.user?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              {data?.motivationalMessage || "Welcome! Start your first topic or study session today to build momentum."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            <div className="px-3.5 sm:px-5 py-2 sm:py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-2.5 sm:gap-3">
              <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-orange-400 fill-orange-400 animate-bounce flex-shrink-0" />
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-black">{data?.user?.streak?.currentStreak ?? 0} Days</div>
                <div className="text-[10px] sm:text-[11px] text-gray-300 uppercase tracking-wider font-semibold">Study Streak</div>
              </div>
            </div>

            <Link
              to="/planner"
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Daily Planner
            </Link>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* PLACEMENT READINESS SCORE WIDGET (0-100 Aggregate) */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-brand-500/30 dark:border-brand-500/20 p-5 sm:p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-dark-border/60 pb-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Score Ring / Pill */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white shadow-xl shadow-brand-500/25 flex-shrink-0">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">{placementReadiness.overallScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-200">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  Placement Readiness Index
                </h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-extrabold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {placementReadiness.targetTier || 'Tier 2 / Tech Product'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                Weighted composite score across DSA mastery, CS fundamentals, System Design, Mock interviews, Aptitude, and Communication.
              </p>
              {placementReadiness.bottleneck && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Bottleneck: <strong className="font-bold">{placementReadiness.bottleneck}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <Link
              to="/interview/room"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              <Mic className="w-3.5 h-3.5" /> AI Mock Interview
            </Link>
            <Link
              to="/company-prep"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-border text-gray-800 dark:text-gray-200 font-bold text-xs transition-all"
            >
              <Building2 className="w-3.5 h-3.5" /> Company Prep
            </Link>
          </div>
        </div>

        {/* 6 Category Breakdown Dimension Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-6">
          {[
            { label: 'DSA Mastery', value: placementReadiness.categoryRatings?.dsa ?? 45, color: 'bg-emerald-500' },
            { label: 'CS Fundamentals', value: placementReadiness.categoryRatings?.csFundamentals ?? 60, color: 'bg-brand-500' },
            { label: 'System Design', value: placementReadiness.categoryRatings?.systemDesign ?? 40, color: 'bg-indigo-500' },
            { label: 'Mock Interview', value: placementReadiness.categoryRatings?.mockInterview ?? 50, color: 'bg-purple-500' },
            { label: 'Aptitude & Logic', value: placementReadiness.categoryRatings?.aptitude ?? 65, color: 'bg-amber-500' },
            { label: 'Communication', value: placementReadiness.categoryRatings?.communication ?? 55, color: 'bg-sky-500' }
          ].map((cat, i) => (
            <div key={i} className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface/60 border border-gray-100 dark:border-dark-border/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-600 dark:text-gray-400 truncate">{cat.label}</span>
                <span className="text-gray-900 dark:text-white font-extrabold">{cat.value}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-2 overflow-hidden">
                <div
                  className={`${cat.color} h-2 rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(100, Math.max(5, cat.value))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK LAUNCH AI ARSENAL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          to="/interview/room"
          className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-purple-500/20 hover:border-purple-500/50 shadow-sm hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
              AI Interview Room
            </div>
            <div className="text-[10px] text-gray-400 truncate">Audio Voice & Follow-ups</div>
          </div>
        </Link>

        <Link
          to="/communication"
          className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-sky-500/20 hover:border-sky-500/50 shadow-sm hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
            <Headset className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-sky-500 transition-colors">
              Communication Coach
            </div>
            <div className="text-[10px] text-gray-400 truncate">LSRW Speech & Writing</div>
          </div>
        </Link>

        <Link
          to="/company-prep"
          className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-violet-500/20 hover:border-violet-500/50 shadow-sm hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-violet-500 transition-colors">
              Company Roadmaps
            </div>
            <div className="text-[10px] text-gray-400 truncate">Google, Amazon, TCS...</div>
          </div>
        </Link>

        <Link
          to="/flashcards"
          className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-amber-500/20 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
              Flashcards SM-2
            </div>
            <div className="text-[10px] text-gray-400 truncate">Spaced Recall Retention</div>
          </div>
        </Link>

        <Link
          to="/resources"
          className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-rose-500/20 hover:border-rose-500/50 shadow-sm hover:shadow-md transition-all group flex items-center gap-3 col-span-2 sm:col-span-1"
        >
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
              Curated Videos
            </div>
            <div className="text-[10px] text-gray-400 truncate">YouTube & Documentation</div>
          </div>
        </Link>
      </div>

      {/* KPI Cards: 5 Cards (Today's Progress, Study Time, Topics Completed, DSA, Accuracy) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
        {/* Today's Progress */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Today's Plan</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.todayProgressPercentage ?? 0}%
            </div>
            <div className="w-full bg-gray-100 dark:bg-dark-surface rounded-full h-1.5 sm:h-2 mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.todayProgressPercentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Study Time */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Study Time</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.totalStudyHoursFormatted || '0h 0m'}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium truncate">
              {metrics.todayStudyMinutes ?? 0} min today
            </p>
          </div>
        </div>

        {/* Topics Completed */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Topics Done</span>
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.topicsCompleted ?? 0} <span className="text-xs sm:text-sm text-gray-400 font-normal">/ {metrics.totalTopics || 0}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium truncate">
              {metrics.overallCompletionPercentage ?? 0}% syllabus
            </p>
          </div>
        </div>

        {/* DSA Solved */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">DSA Solved</span>
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.dsaSolvedCount ?? 0}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium truncate">LeetCode & GFG</p>
          </div>
        </div>

        {/* Practice Accuracy */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {metrics.accuracyPercentage ?? 0}%
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">Diagnostic tier</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Columns & Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* TODAY'S AI PRIORITY SCHEDULE */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-brand-500/20 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's AI Priority Recommendation</h2>
                  <p className="text-xs text-gray-400">Algorithmic recommendation tailored to your weakest points & review spacing</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20">
                AI Powered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {todayPrioritySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-dark-border/60 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{item.badge || '🎯'}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400">{item.type}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.reason}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 dark:border-dark-border/40 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.durationMinutes}m
                    </span>
                    <Link
                      to={item.link || '/practice'}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3" /> Start
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TODAY'S LEARNING PLAN */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
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
        </div>

        {/* Right Column: Weak Areas & Spaced Repetition */}
        <div className="space-y-6">
          {/* YOUR WEAKEST AREAS (Topic Strength Scores 0-100) */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-rose-500/20 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Your Weakest Areas</h3>
                  <p className="text-[11px] text-gray-400">Ranked by Topic Strength (0–100)</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              {weakTopics.slice(0, 4).map((item, idx) => {
                const score = item.strengthScore ?? item.accuracy ?? 35;
                const isCritical = score < 40;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface/40 border border-gray-100 dark:border-dark-border/40 space-y-2 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          {item.topic}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {item.subject}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                        }`}>
                          {item.emoji || (isCritical ? '🔴' : '🟠')} {score}%
                        </span>
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-orange-500'}`}
                        style={{ width: `${Math.max(5, score)}%` }}
                      />
                    </div>

                    {/* Why? Tooltip / Recommendation */}
                    <div className="flex items-start gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Why?</span>
                      <span className="truncate">{item.reason || item.recommendation || 'Low accuracy in recent practice sessions'}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-end gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setTeachModalSubject(item.subject || 'Operating Systems');
                          setTeachModalTopic(item.topic || 'Deadlocks');
                          setTeachModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        Teach Me Again
                      </button>

                      <Link
                        to={`/resources?subject=${encodeURIComponent(item.subject || 'All')}&search=${encodeURIComponent(item.topic)}`}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Video className="w-3 h-3 text-rose-500" />
                        Watch Lectures
                      </Link>

                      <Link
                        to={`/practice?subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.topic)}`}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        AI Practice <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/mistakes"
              className="block text-center text-xs font-bold text-rose-500 hover:underline pt-1"
            >
              Open Mistake Book ({metrics.pendingMistakesCount ?? 0} unresolved) →
            </Link>
          </div>

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

      {/* Teach Me Again AI Pedagogical Modal */}
      <TeachMeAgainModal
        isOpen={teachModalOpen}
        onClose={() => setTeachModalOpen(false)}
        initialSubject={teachModalSubject}
        initialTopic={teachModalTopic}
      />
    </div>
  );
};

export default Dashboard;
