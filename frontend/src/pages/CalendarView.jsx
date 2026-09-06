import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../api/axiosClient';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    try {
      const [taskRes, revRes, sessionRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/revisions?status=All'),
        api.get('/study-sessions')
      ]);
      setTasks(taskRes.data);
      setRevisions(revRes.data);
      setSessions(sessionRes.data);
    } catch (err) {
      console.error('Failed to load calendar data', err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute days in month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getDayDetails = (dayNum) => {
    if (!dayNum) return null;
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.date === formattedDate);
    const dayRevs = revisions.filter(r => r.scheduledDate === formattedDate);
    const daySessions = sessions.filter(s => s.date === formattedDate);
    const studyMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

    const hasCompleted = dayTasks.some(t => t.isCompleted) || studyMins > 0;
    const today = new Date().toISOString().split('T')[0];
    const isPast = formattedDate < today;
    const isToday = formattedDate === today;

    return {
      dateStr: formattedDate,
      tasks: dayTasks,
      revisions: dayRevs,
      studyMinutes: studyMins,
      hasCompleted,
      isMissed: isPast && !hasCompleted && dayTasks.length > 0,
      isToday
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" /> Comprehensive Academic Calendar
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Study Schedule & Revisions Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visual tracking of study days, active revisions, task completions, and missed sessions
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border px-4 py-2 rounded-2xl shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-gray-900 dark:text-white min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="h-24 md:h-28 rounded-2xl bg-gray-50/50 dark:bg-dark-surface/20" />;
            }

            const info = getDayDetails(day);

            return (
              <div
                key={idx}
                className={`h-24 md:h-28 p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                  info.isToday
                    ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md ring-1 ring-brand-500/30'
                    : info.hasCompleted
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : info.isMissed
                    ? 'border-rose-500/20 bg-rose-500/5'
                    : 'border-gray-100 dark:border-dark-border/60 bg-gray-50/50 dark:bg-dark-surface/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold ${info.isToday ? 'text-brand-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>
                  {info.hasCompleted && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Study activity logged" />
                  )}
                  {info.isMissed && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Missed scheduled plan" />
                  )}
                </div>

                {/* Badges inside cell */}
                <div className="space-y-1 overflow-hidden">
                  {info.studyMinutes > 0 && (
                    <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold truncate">
                      {info.studyMinutes}m study
                    </div>
                  )}

                  {info.revisions.length > 0 && (
                    <div className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold truncate flex items-center gap-1">
                      <RotateCcw className="w-2.5 h-2.5" /> {info.revisions.length} rev
                    </div>
                  )}

                  {info.tasks.length > 0 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate hidden md:block">
                      {info.tasks.filter(t => t.isCompleted).length}/{info.tasks.length} tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
