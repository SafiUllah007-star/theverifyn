import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { AuthUser, UserProfile } from '../types';
import { signUpWithEmail, signInWithEmail, resendConfirmationEmail } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, profile: UserProfile) => void;
  initialMode?: 'signup' | 'login';
  subtitleMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signup',
  subtitleMessage,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnconfirmedPossible, setIsUnconfirmedPossible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  
  // Resend state inside modal
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsUnconfirmedPossible(false);
      setEmailConfirmationPending(false);
      setResendStatus(null);
      // Attempt to pre-fill pending email from localStorage
      try {
        const stored = localStorage.getItem('verifyn_pending_email');
        if (stored && !email) setEmail(stored);
      } catch (e) {}
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleResendVerification = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your email address above to receive a new verification link.');
      return;
    }
    setIsResending(true);
    setResendStatus(null);
    try {
      const res = await resendConfirmationEmail(email);
      setResendStatus(res.message || `A fresh confirmation link was sent to ${email}.`);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUnconfirmedPossible(false);
    setResendStatus(null);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.confirmationRequired) {
          setEmailConfirmationPending(true);
          setSuccessMessage(`Confirmation link sent to ${email}. Please check your inbox to activate your account.`);
        } else {
          setSuccessMessage('Account created successfully! Initializing 3 credits...');
          setTimeout(() => {
            onAuthSuccess(result.user, result.profile);
            onClose();
          }, 600);
        }
      } else {
        const result = await signInWithEmail(email, password);
        setSuccessMessage('Authenticated successfully! Welcome back.');
        setTimeout(() => {
          onAuthSuccess(result.user, result.profile);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const msg = err.message || 'Authentication failed. Please verify your credentials and try again.';
      setErrorMessage(msg);
      if (
        err.isUnconfirmedCandidate ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('unconfirmed') ||
        msg.toLowerCase().includes('confirm')
      ) {
        setIsUnconfirmedPossible(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-left"
        >
          {/* Top Decorative Ambient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

          {/* Close Button */}
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Header Badge & Title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 uppercase">
                  Institutional Intelligence Gate
                </span>
              </div>
            </div>

            {emailConfirmationPending ? (
              <div className="space-y-4 py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    We sent a verification email to <strong className="text-slate-900 font-mono">{email}</strong>. Please click the confirmation link in the email to activate your account and claim your 3 free credits.
                  </p>
                </div>

                {resendStatus && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resendStatus}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Localhost Dev Server</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">PORT 3000</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    The email link redirects to <code className="text-emerald-700 font-mono">http://localhost:3000/auth/callback</code>. Make sure your local server is running on port 3000 to avoid connection refused errors.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    id="auth-pending-resend-btn"
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isResending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Didn't receive it? Resend Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailConfirmationPending(false);
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                      setResendStatus(null);
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5">
                  {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {subtitleMessage || (mode === 'signup'
                    ? 'Sign up to unlock 3 complimentary institutional search credits across SEC filings, USPTO patents, and AI risk models.'
                    : 'Sign in to access your saved diligence dossiers and active intelligence credits.')}
                </p>

                {/* Success Message Alert */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-800 font-sans"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span className="leading-snug">{successMessage}</span>
                  </motion.div>
                )}

                {/* Resend Status Alert */}
                {resendStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 font-sans"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span className="leading-snug">{resendStatus}</span>
                  </motion.div>
                )}

                {/* Error Message Alert */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2 text-xs text-rose-700 font-sans"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <span className="leading-snug">{errorMessage}</span>
                    </div>

                    {mode === 'login' && (
                      <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-rose-700 font-medium">
                          Unconfirmed email or expired token?
                        </span>
                        <button
                          id="auth-modal-resend-btn"
                          type="button"
                          onClick={handleResendVerification}
                          disabled={isResending}
                          className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                        >
                          {isResending ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Resend Link</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-name-input"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jordan Miller"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-sans"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Corporate / Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="analyst@fund-capital.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Perks Pill in Signup */}
                  {mode === 'signup' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-900 text-[11px] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>3 Free Institutional Searches</strong> assigned automatically upon registration in public.profiles.
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Register with Email & Password' : 'Sign In to Account'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  {mode === 'signup' ? (
                    <p className="text-xs text-slate-500">
                      Already registered?{' '}
                      <button
                        id="auth-switch-to-login"
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
                      >
                        Sign in here
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Need an account?{' '}
                      <button
                        id="auth-switch-to-signup"
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
                      >
                        Create free account (3 credits)
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
