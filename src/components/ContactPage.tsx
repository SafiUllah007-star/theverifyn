import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Building, Clock, ShieldCheck, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ContactPageProps {
  onBackToSearch: () => void;
  onHandoverClick: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToSearch, onHandoverClick }) => {
  const [name, setName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [subject, setSubject] = useState('Enterprise Due Diligence Inquiry');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState(''); // Honeypot field for anti-bot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [submitResult, setSubmitResult] = useState<{
    success?: boolean;
    inquiryId?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const subjectOptions = [
    'Enterprise Due Diligence Inquiry',
    'API Licensing & Bulk Feeds',
    'Acquire.com Buyer Inquiry',
    'Custom SEC 10-K Forensic Scans',
    'Investor Relations / Data Verification',
    'General Research Desk Inquiry',
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Please provide your full corporate name (at least 2 characters).';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!corporateEmail.trim()) {
      errs.corporateEmail = 'Corporate email address is required.';
    } else if (!emailRegex.test(corporateEmail.trim())) {
      errs.corporateEmail = 'Please provide a valid corporate email format (e.g. name@firm.com).';
    }

    if (!subject.trim()) {
      errs.subject = 'Please select a valid subject.';
    }

    if (!message.trim() || message.trim().length < 10) {
      errs.message = 'Please provide detailed inquiry requirements (at least 10 characters).';
    } else if (message.length > 3000) {
      errs.message = 'Message must be under 3,000 characters.';
    }

    setClientErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          corporateEmail: corporateEmail.trim(),
          subject: subject.trim(),
          message: message.trim(),
          hp: hp.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitResult({
          success: true,
          inquiryId: data.inquiryId,
          message: data.message || 'Your corporate intelligence inquiry has been validated and dispatched to our research desk.',
        });
        // Clear inputs on success
        setName('');
        setCorporateEmail('');
        setMessage('');
      } else {
        setSubmitResult({
          success: false,
          error: data.error || 'Unable to submit inquiry. Please try again or contact us directly.',
        });
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        error: 'Network connection error. Inquiry could not be dispatched.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      
      {/* Abstract fluid color gradients behind the glass layer */}
      <div className="absolute top-1/4 left-10 w-96 h-96 ambient-glow-pink rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />
      <div className="absolute top-1/2 right-10 w-96 h-96 ambient-glow-blue rounded-full blur-3xl pointer-events-none -z-10 opacity-80" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-emerald-800 border border-emerald-200/80 shadow-sm backdrop-blur-md mb-3 font-mono">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          <span>Research Desk & Enterprise Lead Intake</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Contact Verifyn Corporate Intelligence.
        </h1>
        <p className="text-sm text-slate-600">
          Connect directly with our corporate research desk for bespoke diligence requests, bulk API data licensing, or private buyer inquiries.
        </p>
      </div>

      {/* Main Grid: Form + Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Streamlined Glass Card Form */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Submit Corporate Inquiry
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              All communications are protected under strict institutional diligence confidentiality.
            </p>

            {/* Success Feedback Card */}
            {submitResult?.success && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono mb-6 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Inquiry Successfully Dispatched</span>
                </div>
                <p className="text-emerald-700 leading-relaxed font-sans">
                  {submitResult.message}
                </p>
                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                  <span>Tracking Reference ID:</span>
                  <span className="font-bold text-emerald-900">{submitResult.inquiryId}</span>
                </div>
              </div>
            )}

            {/* Error Feedback Card */}
            {submitResult?.error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono mb-6 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-sans">{submitResult.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Honeypot field (hidden from genuine users) */}
              <input
                type="text"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                name="hp_corporate_token"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Representative Name *
                </label>
                <input
                  id="contact-form-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance, Principal"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white/90 border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                    clientErrors.name ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {clientErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-mono">{clientErrors.name}</p>
                )}
              </div>

              {/* Corporate Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <input
                  id="contact-form-email"
                  type="email"
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  placeholder="e.g. evance@blackstone-partners.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white/90 border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                    clientErrors.corporateEmail ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {clientErrors.corporateEmail && (
                  <p className="text-[11px] text-rose-600 mt-1 font-mono">{clientErrors.corporateEmail}</p>
                )}
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Topic *
                </label>
                <select
                  id="contact-form-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer font-sans"
                >
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {clientErrors.subject && (
                  <p className="text-[11px] text-rose-600 mt-1 font-mono">{clientErrors.subject}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Inquiry Details & Scope *
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {message.length} / 3000
                  </span>
                </div>
                <textarea
                  id="contact-form-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please specify target tickers, requested diligence depth, or custom API payload parameters..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white/90 border text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                    clientErrors.message ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {clientErrors.message && (
                  <p className="text-[11px] text-rose-600 mt-1 font-mono">{clientErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="contact-form-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Validating & Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Transmit Corporate Inquiry</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-slate-400 text-center font-mono pt-1">
                Hooked into .env email webhook relay (Resend / Formspree).
              </p>

            </form>
          </GlassCard>
        </div>

        {/* Right: Lead Intake Information & SLA Sidebar */}
        <div className="lg:col-span-5 space-y-4">
          
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Diligence Desk Service Level</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>
                  <strong>Under 4 Hours:</strong> Typical turnaround time for institutional SEC 10-K red flag inquiries and ownership tree disambiguation.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>
                  <strong>Custom API Ingestion:</strong> Inquire about batch endpoints for historical USPTO patents and UK Companies House integration.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>
                  <strong>Encrypted Relay:</strong> Inquiries are processed through server-side proxies without public client-side telemetry leakage.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase mb-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Acquire.com Buyer Channel</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Marketplace Acquisition Inquiries
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you an institutional buyer or private equity syndicator reviewing this codebase on Acquire.com? You can inspect the entire zero-hardcoding architectural manifest online.
            </p>
            <button
              onClick={onHandoverClick}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Inspect Certified Handover Blueprint</span>
            </button>
          </GlassCard>

        </div>

      </div>

    </div>
  );
};
