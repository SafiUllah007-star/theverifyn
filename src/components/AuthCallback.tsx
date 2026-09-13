import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Mail, Send, ExternalLink, Server, Check } from 'lucide-react';
import { clientSupabase, configureClientSupabase, syncUserProfileWithServer, resendConfirmationEmail, getAuthRedirectUrl } from '../lib/supabase';
import { AuthUser, UserProfile } from '../types';

interface AuthCallbackProps {
  onAuthSuccess: (user: AuthUser, profile: UserProfile) => void;
  onNavigate: (page: any) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess, onNavigate }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [statusMessage, setStatusMessage] = useState('Verifying email authorization and activating institutional session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  
  // Resend Verification State
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // Active Origin & Dev Server Detection
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const expectedRedirect = getAuthRedirectUrl();

  useEffect(() => {
    // Attempt to prefill email from local storage or query parameter
    try {
      const storedPending = localStorage.getItem('verifyn_pending_email');
      if (storedPending) setResendEmail(storedPending);
    } catch (e) {}

    let isMounted = true;

    async function processCallback() {
      try {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hash = window.location.hash;

        // Parse hash params if Supabase redirected via fragment
        const hashParams = hash.startsWith('#') ? new URLSearchParams(hash.slice(1)) : new URLSearchParams();

        // Check for error parameters from Auth provider (search query or hash)
        const errorParam = searchParams.get('error') || hashParams.get('error');
        const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        // Check if OTP has expired or token is invalid
        if (
          errorCode === 'otp_expired' ||
          (errorDescription && (errorDescription.toLowerCase().includes('expired') || errorDescription.toLowerCase().includes('invalid')))
        ) {
          setIsOtpExpired(true);
          throw new Error(
            errorDescription || 'Email verification link is invalid or has expired. Security tokens expire after a limited time window.'
          );
        }

        if (errorParam) {
          throw new Error(errorDescription || `Authorization error: ${errorParam}`);
        }

        // Ensure Supabase client is initialized
        let sb = clientSupabase;
        if (!sb) {
          const cfgRes = await fetch('/api/auth/config');
          if (cfgRes.ok) {
            const cfg = await cfgRes.json();
            if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
              sb = configureClientSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey);
            }
          }
        }

        // Extract authorization code if using PKCE
        const code = searchParams.get('code') || hashParams.get('code');
        if (code && sb) {
          setStatusMessage('Exchanging authorization code for institutional session...');
          const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('[AuthCallback] exchangeCodeForSession notice:', exchangeError.message);
          }
        }

        // Retrieve active session from Supabase
        let user: AuthUser | null = null;
        let profile: UserProfile | null = null;

        if (sb) {
          const { data: { session }, error: sessionError } = await sb.auth.getSession();
          if (sessionError) throw sessionError;

          if (session?.user) {
            const u = session.user;
            const meta = u.user_metadata || {};
            const email = u.email || meta.email || '';
            const name = meta.full_name || meta.name || meta.given_name || (email ? email.split('@')[0] : 'Corporate Researcher');
            const avatarUrl = meta.avatar_url || meta.picture;
            const provider = u.app_metadata?.provider || 'email';

            user = {
              id: u.id,
              email,
              name,
              avatar_url: avatarUrl,
              provider,
            };

            setStatusMessage('Verifying corporate intelligence credits and DB trigger...');
            // Guarantee profile exists in public.profiles with 3 credits and email
            profile = await syncUserProfileWithServer(user);
          }
        }

        // If no session found yet via Supabase JS, check server session or fallback
        if (!user || !profile) {
          const cachedRaw = localStorage.getItem('verifyn_auth_session');
          if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            user = parsed.user;
            profile = parsed.profile;
          }
        }

        if (!user || !profile) {
          throw new Error('Could not retrieve user profile from authentication session. Please sign in with your email and password.');
        }

        if (!isMounted) return;

        // Persist session to local storage
        localStorage.setItem('verifyn_auth_session', JSON.stringify({ user, profile }));
        localStorage.setItem('verifyn_user_profile', JSON.stringify(profile));

        setStatus('success');
        setStatusMessage('Email verified successfully! Allocating 3 complimentary intelligence credits...');

        // If this was opened inside an OAuth popup window, notify opener and close
        if (window.opener && window.opener !== window) {
          try {
            window.opener.postMessage(
              {
                type: 'OAUTH_AUTH_SUCCESS',
                user,
                profile,
              },
              '*'
            );
            setTimeout(() => {
              window.close();
            }, 600);
            return;
          } catch (e) {
            console.warn('[AuthCallback] Could not postMessage to opener:', e);
          }
        }

        // Standard in-window redirect
        setTimeout(() => {
          onAuthSuccess(user!, profile!);
          onNavigate('dashboard');
          window.history.replaceState({}, '', '/dashboard');
        }, 800);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[AuthCallback] Error during callback processing:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to complete authentication verification.');
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [onAuthSuccess, onNavigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      setResendError('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(null);

    try {
      const res = await resendConfirmationEmail(resendEmail);
      setResendSuccess(res.message || `A new verification link has been sent to ${resendEmail}.`);
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend confirmation link. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full p-8 rounded-3xl bg-white/95 border border-slate-200/80 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 absolute top-0 left-0 right-0" />

        {status === 'processing' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-200">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Email Verification
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-3 mb-1">
                Activating Supabase Account
              </h2>
              <p className="text-xs text-slate-600 font-mono leading-relaxed mt-2">
                {statusMessage}
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Authorized
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-3 mb-1">
                Account Verified
              </h2>
              <p className="text-xs text-slate-600 font-mono mt-2">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5 animate-in fade-in duration-200 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {isOtpExpired ? 'OTP Expired • Link Invalid' : 'Verification Incomplete'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {isOtpExpired ? 'Email Verification Link Expired' : 'Authentication Challenge'}
                </h2>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 font-sans">
              <p className="font-semibold text-slate-800">Why did this happen?</p>
              <p className="leading-relaxed">
                {isOtpExpired
                  ? 'Supabase security confirmation links expire after a short time window or after being clicked once. Because the token expired, logging in will report unconfirmed credentials until a fresh link is verified.'
                  : errorMessage}
              </p>
            </div>

            {/* Resend Verification Form */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Resend Verification Link to Your Email</span>
              </div>

              {resendSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {resendError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{resendError}</span>
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-2">
                <div className="relative">
                  <input
                    id="callback-resend-email-input"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="w-full pl-3 pr-24 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-sans"
                    required
                  />
                  <button
                    id="callback-resend-submit-btn"
                    type="submit"
                    disabled={isResending}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isResending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>{isResending ? 'Sending...' : 'Resend'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Localhost & Redirect URL Diagnostics Box */}
            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Server className="w-3.5 h-3.5" />
                  Local Development Redirect Config
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  PORT 3000
                </span>
              </div>
              <div className="space-y-1 text-slate-300 text-[10px]">
                <div>
                  <span className="text-slate-500">Active Origin:</span>{' '}
                  <span className="text-emerald-400">{currentOrigin}</span>
                </div>
                <div>
                  <span className="text-slate-500">Redirect Target:</span>{' '}
                  <span className="text-sky-300">{expectedRedirect}</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 leading-normal pt-1 border-t border-slate-800/80">
                Tip: If your browser hit <code className="text-amber-300">ERR_CONNECTION_REFUSED</code> on localhost:3000, verify your local dev server is active (<code className="text-slate-200">npm run dev</code>). In your Supabase Dashboard &gt; Auth &gt; URL Configuration, add <code className="text-emerald-300">http://localhost:3000/auth/callback</code> to Redirect URLs.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                id="callback-go-login-btn"
                onClick={() => {
                  window.history.replaceState({}, '', '/login');
                  onNavigate('search');
                  window.location.href = '/login';
                }}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id="callback-return-terminal-btn"
                onClick={() => {
                  window.history.replaceState({}, '', '/');
                  onNavigate('search');
                }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Return to Search Hub
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Verifyn SEC EDGAR & USPTO Intelligence Core</span>
        </div>
      </div>
    </div>
  );
};

