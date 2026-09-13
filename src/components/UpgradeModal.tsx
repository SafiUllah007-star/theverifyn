import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Sparkles, ExternalLink, RefreshCw, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSubscriptionSuccess: (updatedProfile?: UserProfile) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSubscriptionSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Secret Code State
  const [secretCode, setSecretCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSecretCode('');
      setCodeError(null);
      setCodeSuccess(null);
      setIsProcessing(false);
      setIsRedeeming(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Checkout
  const handleLemonSqueezyCheckout = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro_monthly_999',
          userId: profile.id,
        }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Secret Code Submission (Bypass Payment Gateway on verified secret code)
  const handleApplySecretCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCodeError(null);
    setCodeSuccess(null);

    const trimmed = secretCode.trim();
    if (!trimmed) {
      setCodeError('Please enter a secret code.');
      return;
    }

    setIsRedeeming(true);
    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          userId: profile.id,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setCodeSuccess(data.message || 'Secret code verified! Lifetime free unlimited access granted.');
        setTimeout(() => {
          onSubscriptionSuccess(data.profile);
          onClose();
        }, 900);
      } else {
        setCodeError(data.error || 'Invalid secret code. Please check your code and try again.');
      }
    } catch (err) {
      console.error('Error redeeming code:', err);
      setCodeError('Network error verifying secret code. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white/95 border border-white/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-900 overflow-hidden">
        
        {/* Soft Ambient Refraction */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          id="upgrade-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 mb-2.5 font-mono shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Institutional Tier
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Upgrade to Verifyn Pro
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Unlimited corporate intelligence, full Cap Table structures, and Gemini AI forensic auditing.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 flex items-baseline justify-between shadow-xs">
          <div>
            <span className="text-xs text-slate-500 font-mono block">Subscription Plan</span>
            <span className="text-sm font-bold text-slate-900">Professional Researcher</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">$9.99</span>
            <span className="text-xs text-slate-500 font-mono"> / month</span>
          </div>
        </div>

        {/* Pro Capabilities Checklist */}
        <div className="space-y-2.5 mb-6 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span><strong>Unlimited Company Audits</strong> (Bypasses free 3-credit restriction)</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span><strong>Cap Table Timeline & 13F Ownership</strong> (Institutional vs. Insider equity)</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span><strong>Gemini AI 10-K Red Flag Forensics</strong> (Structured JSON risk score)</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span><strong>US PatentsView Registry</strong> (Active USPTO intellectual property)</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span><strong>Competitor Valuation Matrix & PDF Export</strong> (Formatted diligence reports)</span>
          </div>
        </div>

        {/* Primary Checkout Button */}
        <div className="space-y-3">
          <button
            id="upgrade-now-btn"
            onClick={handleLemonSqueezyCheckout}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-900/20 hover:shadow-lg"
          >
            <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span>Upgrade Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>

          {/* Secret Code / Bypass Payment Gateway Section */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="secret-code-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Have a secret code?</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Bypass Gateway</span>
            </div>

            <form onSubmit={handleApplySecretCode} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="secret-code-input"
                    type="text"
                    value={secretCode}
                    onChange={(e) => {
                      setSecretCode(e.target.value);
                      if (codeError) setCodeError(null);
                    }}
                    placeholder="Enter secret code..."
                    disabled={isRedeeming || !!codeSuccess}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase tracking-wider"
                  />
                </div>
                <button
                  id="secret-code-submit-btn"
                  type="submit"
                  disabled={isRedeeming || !!codeSuccess}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs font-mono transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  {isRedeeming ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isRedeeming ? 'Checking...' : 'Apply Code'}</span>
                </button>
              </div>

              {/* Error Alert */}
              {codeError && (
                <div
                  id="secret-code-error-msg"
                  className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in duration-150 font-sans"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{codeError}</span>
                </div>
              )}

              {/* Success Alert */}
              {codeSuccess && (
                <div
                  id="secret-code-success-msg"
                  className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-150 font-sans"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{codeSuccess}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-slate-400 text-center font-mono mt-4">
          Enterprise & Institutional Diligence • Secure Instant Activation
        </p>

      </div>
    </div>
  );
};

