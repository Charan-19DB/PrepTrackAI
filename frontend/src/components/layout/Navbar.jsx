import React from 'react';
import {
  Search,
  Flame,
  Zap,
  Timer,
  Moon,
  Sun,
  Menu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';

export const Navbar = ({ onOpenSearch, onToggleSidebar, isSidebarOpen }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isActive, isMinimized, setIsMinimized, formatTime, secondsLeft, startTimer } = useTimer();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-dark-border bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left side: Mobile menu toggle + Global Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search button that triggers Ctrl+K modal */}
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full md:w-80 px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/60 text-gray-500 dark:text-gray-400 hover:border-brand-500/50 hover:bg-gray-100/80 dark:hover:bg-dark-surface transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
            <span className="hidden sm:inline">Search topics, DSA, notes...</span>
            <span className="sm:hidden">Search...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Streak, XP, Verified Badge, Pomodoro Quick Indicator, Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Verified Student Badge */}
        {user?.isEmailVerified && (
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold cursor-default"
            title="Verified CSE Student • Cloud Sync Active"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified</span>
          </div>
        )}

        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs sm:text-sm font-bold shadow-sm">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-bounce" />
          <span>{user?.streak?.currentStreak ?? 0} <span className="hidden sm:inline">Days</span></span>
        </div>

        {/* XP & Level Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
          <span>Lvl {user?.level || 1} • {user?.xp ?? 0} XP</span>
        </div>

        {/* Pomodoro Timer Badge / Trigger */}
        <button
          onClick={() => {
            if (!isActive) startTimer(25);
            setIsMinimized(!isMinimized);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isActive
              ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400 animate-pulse'
              : 'bg-gray-100 dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-500'
          }`}
          title="Toggle Pomodoro Study Timer"
        >
          <Timer className="w-4 h-4" />
          <span className="font-mono">{isActive ? formatTime(secondsLeft) : '25m Focus'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
