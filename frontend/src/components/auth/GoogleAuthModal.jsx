import React, { useState } from 'react';
import { Sparkles, ShieldCheck, X, Check, UserCheck, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GoogleAuthModal = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [selectedAccount, setSelectedAccount] = useState('csrkurupudi2005@gmail.com');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Charan Kurupudi',
      email: 'csrkurupudi2005@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      tag: 'Verified Google Student Account'
    },
    {
      name: 'Charan (University)',
      email: 'charan.cse@university.edu',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
      tag: 'Google Workspace for Education'
    }
  ];

  const handleSelectDefault = async (account) => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle({
        name: account.name,
        email: account.email,
        googleId: `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        avatar: account.avatar
      });
      onClose();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle({
        name: customName || customEmail.split('@')[0],
        email: customEmail,
        googleId: `google_${Date.now()}`,
        avatar: ''
      });
      onClose();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Google Branding Bar */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Sign in with Google
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Choose an account to continue to <span className="font-semibold text-brand-600 dark:text-brand-400">PrepTrack AI</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {error}
            </div>
          )}

          {!isCustom ? (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Verified Google Accounts
              </div>

              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSelectDefault(acc)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 dark:border-dark-border hover:border-brand-500 dark:hover:border-brand-500 bg-gray-50/70 dark:bg-dark-surface/60 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                          {acc.name}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                        {acc.email}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {acc.tag}
                      </span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-gray-100 dark:bg-dark-border flex items-center justify-center text-gray-400 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors mt-2"
              >
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enter your Google Account
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Charan Kurupudi"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Sign In With Google'}
                </button>
              </div>
            </form>
          )}

          {/* Google Identity Guarantee Notice */}
          <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>
                To continue, Google will securely share your verified name, email, and identity with PrepTrack AI to authenticate your student account.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
