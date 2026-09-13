import React from 'react';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './GlassCard';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb / Back Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hub</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Last Updated: September 2026</span>
        </div>
      </motion.div>

      {/* Main Glass Document Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <GlassCard className="p-8 sm:p-12 border border-slate-200/80 bg-white/80 shadow-lg relative">
          
          {/* Header Banner */}
          <div className="pb-8 border-b border-slate-200/80 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono shadow-xs mb-3">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>SaaS Compliance & GDPR/CCPA Standard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Privacy Policy & Data Transparency
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-mono mt-1">
              Verifyn Corporate Intelligence Platform • Effective Date: September 1, 2026
            </p>
          </div>

          {/* Content Document */}
          <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-6">
            
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                1. Executive Summary & Privacy Commitment
              </h2>
              <p>
                Verifyn (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) provides high-fidelity corporate intelligence and forensic due diligence tools for research professionals, institutional investors, and due diligence teams. We are committed to protecting your privacy through minimal data retention, transparent telemetry, and adherence to global data privacy statutes including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                2. Information We Collect
              </h2>
              <p>
                We do not harvest, monetize, or sell user identities or telemetry. Our data collection is limited to what is strictly necessary to provide and secure the services:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <strong>Account & Authentication:</strong> Email address, hashed credentials, and subscription status managed securely through Supabase Auth and Row Level Security (RLS) policies.
                </li>
                <li>
                  <strong>Search Queries:</strong> Stock tickers, company names, and public filing queries submitted to our analytics pipeline to calculate search credit balances and serve cached public filings.
                </li>
                <li>
                  <strong>Billing Telemetry:</strong> Transaction identifiers and subscription state provided via webhook events from our Merchant of Record, Lemon Squeezy. We never store credit card numbers on Verifyn servers.
                </li>
                <li>
                  <strong>Technical Telemetry:</strong> Standard IP addresses, browser User-Agent strings, and timestamp logs retained temporarily for rate limiting and fraud prevention.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                3. Public Sector Data Aggregation (SEC EDGAR & PatentsView)
              </h2>
              <p>
                All company filings, executive rosters, and patent documents surfaced in Verifyn are public statutory records obtained in strict compliance with federal guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <strong>U.S. SEC EDGAR:</strong> Filings (Form 10-K, 10-Q, 8-K, 13F) are queried in compliance with the SEC Fair Access Policy (10 requests/second threshold with designated <code>Sample Company User-Agent</code> headers).
                </li>
                <li>
                  <strong>USPTO PatentsView:</strong> Patent grant abstracts and inventor records are retrieved via public Open API endpoints released under Open Government Data directives.
                </li>
                <li>
                  <strong>UK Companies House:</strong> Public statutory registrations obtained via the UK Government public register.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                4. Cookies & Local Browser Storage
              </h2>
              <p>
                Verifyn utilizes local storage and first-party session tokens solely for authentication persistence, theme preferences, and search state management. We do not deploy third-party advertising cookies or cross-site tracking pixels.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                5. Third-Party Service Providers
              </h2>
              <p>
                We partner with specialized, industry-standard infrastructure providers to deliver our services:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Lemon Squeezy Inc.</div>
                  <div className="text-slate-500 text-[11px]">Merchant of Record & Global Tax Compliance</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Supabase (PostgreSQL)</div>
                  <div className="text-slate-500 text-[11px]">Row Level Security Database Hosting</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Google Gemini Cloud</div>
                  <div className="text-slate-500 text-[11px]">Server-side 10-K Forensic AI Parsing</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">Cloud Run Containers</div>
                  <div className="text-slate-500 text-[11px]">High-Availability Stateless Web Compute</div>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                6. Your Rights (GDPR & CCPA)
              </h2>
              <p>
                Regardless of your residency, you retain full rights to inspect, export, or delete your account records at any time. To request complete account erasure, submit a request via our Contact Desk or email <code>privacy@verifyn-intel.io</code>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                7. Contact Information
              </h2>
              <p>
                Inquiries concerning this Privacy Policy or data protection practices can be addressed directly to our Data Protection Officer at:
              </p>
              <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 font-mono text-xs text-slate-800">
                Verifyn Corporate Intelligence<br />
                Attn: Privacy & Data Protection Compliance<br />
                Email: privacy@verifyn-intel.io<br />
                Desk: /contact
              </div>
            </section>

          </div>

          {/* Footer Affirmation */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Audit Trail Verified</span>
            </div>
            <button
              onClick={onBack}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
            >
              Return to Platform →
            </button>
          </div>

        </GlassCard>
      </motion.div>

    </div>
  );
};
