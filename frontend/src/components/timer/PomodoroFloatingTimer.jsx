import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Timer, Sparkles } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export const PomodoroFloatingTimer = () => {
  const {
    mode,
    setMode,
    secondsLeft,
    isActive,
    isPaused,
    isMinimized,
    setIsMinimized,
    subject,
    setSubject,
    topic,
    setTopic,
    sessionNote,
    setSessionNote,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    manualComplete,
    formatTime,
    completedSessionsCount
  } = useTimer();

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md border transition-all ${
            isActive
              ? 'bg-brand-600/90 text-white border-brand-400/30 shadow-brand-500/25 animate-pulse'
              : 'bg-white/90 dark:bg-dark-card/90 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-dark-border hover:border-brand-500'
          }`}
        >
          <Timer className="w-5 h-5 text-amber-400" />
          <div className="flex flex-col text-left">
            <span className="font-mono text-sm font-bold tracking-wider">{formatTime(secondsLeft)}</span>
            <span className="text-[10px] text-gray-400 dark:text-gray-400 truncate max-w-[120px]">{topic || subject}</span>
          </div>
          <ChevronUp className="w-4 h-4 ml-1 opacity-70" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500">
            <Timer className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">Pomodoro Study Timer</span>
        </div>
        <div className="flex items-center gap-1.5">
          {completedSessionsCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              {completedSessionsCount} done
            </span>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl mb-3 text-xs font-semibold">
        {[25, 50, 15].map((mins) => (
          <button
            key={mins}
            onClick={() => {
              setMode(mins);
              startTimer(mins);
            }}
            className={`py-1.5 rounded-lg transition-all ${
              mode === mins
                ? 'bg-white dark:bg-dark-card text-brand-600 dark:text-brand-400 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {mins} min
          </button>
        ))}
      </div>

      {/* Subject & Topic binding */}
      <div className="space-y-2 mb-3 text-xs">
        <div>
          <label className="block text-gray-500 dark:text-gray-400 font-medium mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500"
            placeholder="e.g. DBMS and SQL"
          />
        </div>
        <div>
          <label className="block text-gray-500 dark:text-gray-400 font-medium mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500"
            placeholder="e.g. Normalization"
          />
        </div>
      </div>

      {/* Countdown display */}
      <div className="text-center py-2">
        <div className="font-mono text-4xl font-extrabold tracking-wider text-gray-900 dark:text-white">
          {formatTime(secondsLeft)}
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {isActive ? (isPaused ? 'Paused' : 'Focus session active') : 'Ready to start'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {!isActive ? (
          <button
            onClick={() => startTimer()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all w-full justify-center"
          >
            <Play className="w-4 h-4 fill-white" /> Start Studying
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={resumeTimer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex-1 justify-center"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex-1 justify-center"
              >
                <Pause className="w-3.5 h-3.5 fill-white" /> Pause
              </button>
            )}
            <button
              onClick={manualComplete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex-1 justify-center"
              title="Finish & log session now"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Done
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-xl border border-gray-200 dark:border-dark-border text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PomodoroFloatingTimer;
