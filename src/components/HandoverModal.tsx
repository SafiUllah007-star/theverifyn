import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Database, Server, Copy, Check } from 'lucide-react';

interface HandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- 1. Supabase Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  credits INT DEFAULT 3,
  is_pro BOOLEAN DEFAULT FALSE,
  lemon_squeezy_customer_id TEXT,
  created_at TIMESTAMP WITH TIMEZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Database Trigger for Email & Password Signups (Assigns 3 free credits)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, is_pro)
  VALUES (new.id, new.email, 3, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Supabase Auth Redirect URLs (Auth > URL Configuration):
-- Site URL: http://localhost:3000
-- Additional Redirect URLs:
-- http://localhost:3000/auth/callback
-- http://localhost:3000
-- https://<YOUR-APP-DOMAIN>/auth/callback`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white/95 border border-white/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-slate-900 overflow-y-auto max-h-[90vh]">
        
        {/* Soft Ambient Refraction */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          id="handover-modal-close-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-50 text-sky-800 border border-sky-300 mb-2.5 font-mono shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            Acquire.com Buyer Handover Dossier
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            White-Label Architecture & Zero-Hardcoding Guarantee
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Engineered for frictionless marketplace resale and turnkey redeployment.
          </p>
        </div>

        {/* Handover Audit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Founder Credentials</span>
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              0% Hardcoded
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Strict .env isolation</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">External Data Cost</span>
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              $0 / month
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">100% Free public APIs</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">Payment Engine</span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lemon Squeezy
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">Test Sandbox Webhooks</span>
          </div>
        </div>

        {/* Section 1: Supabase Schema */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>1. Supabase PostgreSQL Schema (public.profiles)</span>
            </div>
            <button
              id="copy-sql-schema-btn"
              onClick={copySql}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-[11px] font-mono text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto shadow-inner">
            {sqlSchema}
          </pre>
        </div>

        {/* Section 2: Zero-Cost Free Data Pipelines */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 mb-2">
            <Server className="w-4 h-4 text-sky-600" />
            <span>2. Zero-Paid-Key Data Pipeline Architecture</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span><strong>SEC EDGAR API:</strong> Form 10-K, 10-Q & 13F ownership via custom User-Agent</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">$0 Free Open Gov</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span><strong>Yahoo Finance (yfinance protocol):</strong> Historical charts, EV multiples & segments</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">$0 Free Open</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span><strong>PatentsView Open REST API:</strong> US Patent & Trademark office index</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">$0 No USPTO Key</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span><strong>Companies House UK:</strong> Incorporation dates, status & subsidiary registry</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">$0 Free Registry</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span><strong>Google Gemini 1.5/3.8 Flash:</strong> 10-K structured JSON risk score & red flags</span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">Server Proxy</span>
            </div>
          </div>
        </div>

        {/* Section 3: Anti-Abuse Protection Architecture */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Multi-Layered Anti-Abuse System Architecture</span>
          </div>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong>IP Rate Limiting (Upstash Redis):</strong> Max 3 searches / 30 days per network IP.
                <p className="text-[11px] text-slate-500 font-normal">Blocks users resetting accounts or switching users on the same Wi-Fi.</p>
              </div>
              <span className="text-emerald-700 font-mono text-[10px] font-bold shrink-0 ml-2">Active</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong>Device Fingerprinting (FingerprintJS):</strong> Hardware, canvas & screen resolution signature.
                <p className="text-[11px] text-slate-500 font-normal">Incognito mode & cookie deletion do NOT reset hardware identity.</p>
              </div>
              <span className="text-emerald-700 font-mono text-[10px] font-bold shrink-0 ml-2">Active</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <strong>Disposable Email Blocker:</strong> Rejects TempMail, 10MinuteMail & throwaway domains.
                <p className="text-[11px] text-slate-500 font-normal">Only corporate and reputable personal email domains permitted.</p>
              </div>
              <span className="text-emerald-700 font-mono text-[10px] font-bold shrink-0 ml-2">Active</span>
            </div>
          </div>
        </div>

        {/* Section 4: Buyer Handover Instructions */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5 font-mono mb-5">
          <span className="text-slate-900 font-bold block">4. Step-by-Step Buyer Handover Guide:</span>
          <p>1. Copy <code>.env.example</code> to <code>.env</code> on production server.</p>
          <p>2. Paste your own Supabase project URL and service role keys into <code>.env</code>.</p>
          <p>3. Execute the schema above inside Supabase SQL Editor to instantiate the <code>profiles</code> table.</p>
          <p>4. Set Lemon Squeezy Store ID & Webhook Secret to point to <code>/api/webhooks/payment</code>.</p>
          <p>5. (Optional) Provide <code>UPSTASH_REDIS_REST_URL</code> for edge Redis clustering.</p>
        </div>

        {/* Dismiss Button */}
        <div className="text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Close Handover Audit
          </button>
        </div>

      </div>
    </div>
  );
};
