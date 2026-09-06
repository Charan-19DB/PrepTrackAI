import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, Sparkles, X, RefreshCw, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmailVerificationModal = ({ isOpen, onClose }) => {
  const { user, sendEmailVerification, verifyEmailCode } = useAuth();
  const [targetEmail, setTargetEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setTargetEmail(user.email);
    }
  }, [user?.email, isOpen]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!targetEmail || !targetEmail.trim()) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await sendEmailVerification(targetEmail.trim());
      setCode(''); // Keep empty so student enters the code sent to their Gmail
      setStatusMsg(res?.message || `6-digit verification code sent to ${targetEmail.trim()}! Please check your Gmail.`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyEmailCode(code);
      setVerifiedSuccess(true);
      setTimeout(() => {
        onClose();
        setVerifiedSuccess(false);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-dark-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Student Email Verification
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Verify or update your student email address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {verifiedSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 animate-in zoom-in-90">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Identity Verified!
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Your student email ({targetEmail}) is confirmed. You now have full access to official placement analytics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Editable Email Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Student Email Address (Editable)</span>
                </label>
                <span className="text-[10px] text-gray-400 font-medium">
                  Type your real email
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="name@college.edu or gmail.com"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading || !targetEmail}
                  className="px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                  title="Send verification code to this address"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{sentCode ? 'Resend' : 'Send Code'}</span>
                </button>
              </div>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{statusMsg} {sentCode ? `(Code: ${sentCode})` : ''}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 849201"
                  className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !code}
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? 'Verifying...' : 'Verify Email Code'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;
