import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Key,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Save,
  Bell,
  Volume2,
  Mail,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EmailVerificationModal from '../components/auth/EmailVerificationModal';
import GoogleAuthModal from '../components/auth/GoogleAuthModal';

export const Settings = () => {
  const { user, updateProfile, updateSettings } = useAuth();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState({
    name: user?.name || 'Charan',
    targetRole: user?.targetRole || 'Software Development Engineer (SDE)',
    placementYear: user?.placementYear || 2026,
    college: user?.college || 'Computer Science & Engineering'
  });

  const [aiApiKey, setAiApiKey] = useState(user?.settings?.geminiApiKey || '');
  const [dailyGoalMins, setDailyGoalMins] = useState(user?.settings?.dailyStudyGoalMinutes || 180);
  const [soundEnabled, setSoundEnabled] = useState(user?.settings?.soundEnabled ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      await updateSettings({
        geminiApiKey: aiApiKey,
        dailyStudyGoalMinutes: Number(dailyGoalMins),
        soundEnabled
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings', err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
            <SettingsIcon className="w-4 h-4" /> System Preferences
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1">
            Settings & Security
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Personalize profile, identity verification, Google sign-in, and AI keys
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" /> Preferences Saved
          </div>
        )}
      </div>

      {/* Account Verification & Security Banner Card */}
      <div className="rounded-3xl bg-gradient-to-br from-gray-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
              user?.isEmailVerified 
                ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">
                  {user?.isEmailVerified ? 'Verified Student Account' : 'Verification Pending'}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  user?.isEmailVerified 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {user?.isEmailVerified ? 'Active & Verified' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {user?.isEmailVerified 
                  ? `Authenticated as ${user?.email} • Placement analytics and cloud data backed up.`
                  : `Verify ${user?.email} to unlock official CSE placement certificates.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!user?.isEmailVerified && (
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Verify Email (OTP)
              </button>
            )}

            <button
              onClick={() => setShowGoogleModal(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{user?.authProvider === 'google' ? 'Google Account Connected' : 'Connect Google Sign-In'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-dark-border pb-3">
            <User className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Student Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Target Placement Role</label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                placeholder="e.g. SDE-1 / Software Engineer"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Placement Batch Year</label>
              <input
                type="number"
                value={profile.placementYear}
                onChange={(e) => setProfile({ ...profile, placementYear: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Major / Branch</label>
              <input
                type="text"
                value={profile.college}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-dark-border pb-3">
            <Sun className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Interface Appearance</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode', desc: 'Optimized for nighttime coding' },
              { id: 'light', label: 'Light Mode', desc: 'High contrast daylight' },
              { id: 'system', label: 'System Sync', desc: 'Follows operating system' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  theme === t.id
                    ? 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-500 shadow-sm ring-1 ring-brand-500/30'
                    : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-borderLight'
                }`}
              >
                <span className="font-bold text-sm text-gray-900 dark:text-white block">{t.label}</span>
                <span className="text-xs text-gray-400 mt-1 block">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modular AI API Key Configuration */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Modular AI Engine</h3>
                <p className="text-xs text-gray-400">Google Gemini & Local Knowledge Fallback</p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
              Modular Active
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Google Gemini API Key (Optional)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed bg-gray-50 dark:bg-dark-surface p-3 rounded-xl border border-gray-100 dark:border-dark-border">
              💡 <strong>Zero Setup Required:</strong> Even without an API key, PrepTrack AI's built-in intelligent CSE placement knowledge engine powers all features: AI Study Planner, AI Tutor, Mock Interviewer, and Quiz Generators seamlessly!
            </p>
          </div>
        </div>

        {/* Goals & Study Habits */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-dark-border pb-3">
            <Volume2 className="w-5 h-5 text-brand-500" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Habits & Audio</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Daily Study Goal (Minutes)
              </label>
              <input
                type="number"
                value={dailyGoalMins}
                onChange={(e) => setDailyGoalMins(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white block">Pomodoro Chimes</span>
                <span className="text-[11px] text-gray-400">Play chime when focus blocks complete</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" /> Save All Preferences
          </button>
        </div>
      </form>

      {/* Modals */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
      />
    </div>
  );
};

export default Settings;
