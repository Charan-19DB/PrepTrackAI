import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthModal from '../components/auth/GoogleAuthModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('charan@example.com', 'password123');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
            <Sparkles className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            PrepTrack<span className="text-brand-500">.AI</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sign in to continue your placement preparation roadmap
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real Google Single Sign-On Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-[#1f293d] text-gray-800 dark:text-gray-100 font-bold text-xs border border-gray-300 dark:border-dark-border shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign in with Google Mail</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            Verified
          </span>
        </button>

        {/* Quick Demo Preview Button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-200 font-bold text-xs border border-gray-600/40 shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-brand-400" /> Quick Demo Preview (Pre-seeded Sample Data)
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 dark:border-dark-border w-full" />
          <span className="bg-white dark:bg-[#111827] px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider absolute">
            or with credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu or gmail.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Register now
          </Link>
        </p>

        {/* Real Google Authentication Modal */}
        <GoogleAuthModal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
        />

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          initialEmail={email}
        />
      </div>
    </div>
  );
};

export default Login;
