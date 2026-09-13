import React from 'react';
import { ShieldCheck, Database, Sparkles, Scale, Server, CheckCircle2, Lock, ArrowRight, Cpu, Layers, ExternalLink, Award } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AboutPageProps {
  onStartSearch: (ticker: string) => void;
  onContactClick: () => void;
  onHandoverClick: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onStartSearch,
  onContactClick,
  onHandoverClick,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      
      {/* Background ambient mesh gradients */}
      <div className="absolute top-10 left-10 w-96 h-96 ambient-glow-blue rounded-full blur-3xl pointer-events-none -z-10 opacity-70" />
      <div className="absolute top-60 right-10 w-96 h-96 ambient-glow-pink rounded-full blur-3xl pointer-events-none -z-10 opacity-60" />

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/80 text-emerald-800 border border-emerald-200/80 shadow-sm backdrop-blur-md mb-3 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verifyn Platform Narrative</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Democratizing Forensic Corporate Intelligence.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Traditional hedge fund terminals charge upwards of $24,000/seat/year for corporate data. Verifyn disintermediates legacy gatekeepers by programmatically federating open governmental registries and autonomous AI forensics into a single studio glass interface.
        </p>
      </div>

      {/* Main Two-Column Structure inside Single Massive Glass Card */}
      <GlassCard className="p-8 sm:p-12 mb-10 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-100/40 via-sky-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 relative z-10">
          
          {/* Left Column: Mission & Core Philosophy */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Section: Our Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Our Mission</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Verifying Corporate Truth Across Global Capital Markets
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                In an era crowded by promotional investor relations press releases and synthetic hype, institutional capital allocators require raw, unmanipulated filings. Our mission is to eliminate corporate obfuscation by cross-referencing statutory US SEC EDGAR disclosures, international corporate registries, and active patent issuances.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 leading-relaxed font-mono space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>The Zero-Mock Data Guarantee</span>
                </div>
                <p className="text-emerald-800">
                  Every metric surfaced by Verifyn originates from public governmental records or authoritative exchange nodes. We reject simulated placeholders in favor of auditable CIK and registration references.
                </p>
              </div>
            </div>

            {/* Section: Commitment to Data Accuracy */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-sky-700 uppercase">
                <Scale className="w-4 h-4 text-sky-600" />
                <span>Our Commitment to Data Accuracy</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Algorithmic Triangulation & Discrepancy Auditing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When evaluating an enterprise, no single filing tells the complete story. Verifyn enforces algorithmic multi-vector consensus:
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Direct Statutory Aggregation</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      We pull directly from Form 10-K, 10-Q, and 13F schedules using our authenticated Federal User-Agent pipeline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Autonomous LLM Audit Parsing</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      Gemini 1.5/3.8 Flash ingests complex legal disclosures to distill forensic risk indexes (0-100) and identify hidden footnotes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Cross-Border Verification</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      UK Companies House registration and PatentsView patent assignments confirm true beneficial ownership and operational footprints.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: How Verifyn Works (Zero-Cost Architecture Flow) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-emerald-700 uppercase">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>How Verifyn Works</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Zero-Cost Data Pipeline Architecture
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than burdening operators or buyers with exorbitant enterprise vendor bills (e.g. S&P CapIQ, Bloomberg), Verifyn synthesizes five high-authority public streams into one synchronized JSON engine:
              </p>
            </div>

            {/* Step-by-step pipeline cards */}
            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                    SEC EDGAR API Pipeline
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">$0 Open Gov</span>
                </div>
                <p className="text-slate-600 text-[11px] font-sans">
                  Query CIK mappings, historical Form 10-K financial disclosures, and quarterly institutional 13F ownership concentrations with zero licensing fees.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                    Yahoo Finance Multiples Feed
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">$0 Public Node</span>
                </div>
                <p className="text-slate-600 text-[11px] font-sans">
                  Normalized enterprise value, revenue multiples, live gross margins, and historical equity trends updated every trading session.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                    PatentsView REST Endpoint
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">$0 USPTO Public</span>
                </div>
                <p className="text-slate-600 text-[11px] font-sans">
                  US Patent and Trademark Office data indexing full-text abstracts, technology classification tags, and assigned corporate holders.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                    Gemini AI Structured Forensics
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Server Proxy</span>
                </div>
                <p className="text-slate-600 text-[11px] font-sans">
                  Strict schema-constrained JSON generator scoring risk on a calibrated 0-100 scale, highlighting legal proceedings and debt convenants.
                </p>
              </div>

            </div>

            {/* Quick Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Acquiring or Deploying Verifyn?</span>
                <span className="text-[11px] text-slate-500">Read our certified buyer handover blueprint.</span>
              </div>
              <button
                onClick={onHandoverClick}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Inspect Handover
              </button>
            </div>

          </div>

        </div>

      </GlassCard>

      {/* Bottom CTA Card */}
      <GlassCard className="p-6 sm:p-8 text-center max-w-2xl mx-auto flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Ready to Audit an Enterprise?
        </h3>
        <p className="text-xs text-slate-600 mb-4 max-w-md">
          Test Verifyn with a live public ticker or submit an enterprise licensing inquiry.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onStartSearch('TSLA')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            Launch Tesla Audit ($TSLA)
          </button>
          <button
            onClick={onContactClick}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Contact Research Desk
          </button>
        </div>
      </GlassCard>

    </div>
  );
};
