import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  BookOpen,
  CheckCircle2,
  Code2,
  Calculator,
  MessageSquareCode,
  RotateCcw,
  FolderGit2,
  BarChart3,
  Calendar,
  FileText,
  AlertOctagon,
  Target,
  Settings,
  LogOut,
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Learning Roadmap', path: '/roadmap', icon: Compass },
  { name: 'Daily Planner', path: '/planner', icon: CalendarCheck },
  { name: 'Topic Explorer', path: '/topics', icon: BookOpen },
  { name: 'Practice Hub', path: '/practice', icon: CheckCircle2 },
  { name: 'DSA Tracker', path: '/dsa', icon: Code2 },
  { name: 'Aptitude Practice', path: '/aptitude', icon: Calculator },
  { name: 'Interview Prep', path: '/interview', icon: MessageSquareCode },
  { name: 'Revision System', path: '/revisions', icon: RotateCcw, badge: 'Due' },
  { name: 'Projects Tracker', path: '/projects', icon: FolderGit2 },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Notes Hub', path: '/notes', icon: FileText },
  { name: 'Mistake Book', path: '/mistakes', icon: AlertOctagon },
  { name: 'Goals Tracker', path: '/goals', icon: Target },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-72 max-w-[85vw] transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-dark-border bg-white dark:bg-[#0E131F] flex flex-col justify-between ${
        /* Mobile: slide in/out drawer */
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      } ${
        /* Desktop: always visible */
        isOpen ? 'md:translate-x-0 md:w-64' : 'md:translate-x-0 md:w-20'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div className={`flex flex-col ${!isOpen ? 'md:hidden' : ''}`}>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                PrepTrack<span className="text-brand-500">.AI</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                CSE Placement LMS
              </span>
            </div>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors md:hidden"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links with smooth scrollable container */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface'
                  }`
                }
                title={!isOpen ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className={`truncate ${!isOpen ? 'md:hidden' : ''}`}>{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-400 font-semibold border border-amber-500/30 ${!isOpen ? 'md:hidden' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Download Native Android APK */}
      <div className="px-3 py-2">
        <a
          href="/PrepTrackAI-Mobile.apk"
          download="PrepTrackAI-Mobile.apk"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-sm group"
          title="Download Android Native APK"
        >
          <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
          <span className={`truncate ${!isOpen ? 'md:hidden' : ''}`}>Download Mobile APK</span>
        </a>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 relative overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')
              )}
              {user?.isEmailVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white dark:border-dark-surface flex items-center justify-center">
                  <ShieldCheck className="w-2 h-2 text-white" />
                </span>
              )}
            </div>
            <div className={`flex flex-col truncate ${!isOpen ? 'md:hidden' : ''}`}>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {user?.name || user?.email?.split('@')[0] || 'Student'}
                </span>
                {user?.isEmailVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" title="Verified CSE Student" />
                )}
              </div>
              <span className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 font-medium">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                {user?.streak?.currentStreak ?? 0}d Streak
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${!isOpen ? 'md:hidden' : ''}`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
