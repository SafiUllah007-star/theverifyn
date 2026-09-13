import React, { useState } from 'react';
import { Check, Zap, HelpCircle, ChevronDown, ShieldCheck, Sparkles, ArrowRight, Star, Building, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { UserProfile } from '../types';

interface PricingPageProps {
  profile: UserProfile;
  onOpenUpgradeModal: () => void;
  onStartSearch: (query: string) => void;
  onHandoverClick: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'How does Verifyn gather SEC EDGAR and PatentsView data without paid API keys?',
    answer:
      'Verifyn interfaces directly with US federal public sector endpoints: the SEC EDGAR companyFacts and submission API (using custom compliant User-Agent headers as mandated by SEC regulations) and the USPTO PatentsView Open API. Both data pipelines require zero paid subscription keys, guaranteeing 99%+ operational gross margins for platform acquirers.',
  },
  {
    question: 'What happens when my 3 free searches are exhausted?',
    answer:
      'The platform prompts you to activate Verifyn Pro ($9.99/month). With Pro, credit limitations are removed entirely, granting you unlimited entity queries, unredacted 13F institutional ownership breakdowns, Gemini AI 10-K forensic risk analysis, and uncompressed PDF exports.',
  },
  {
    question: 'How is the Gemini AI risk assessment generated?',
    answer:
      'Verifyn passes statutory Item 1A (Risk Factors) disclosures from official SEC 10-K annual filings through Google Gemini (via secure server-side proxy). The engine parses complex legal disclosures into an objective 0-100 risk score, identifies top statutory red flags, and creates a concise executive audit summary.',
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      'Yes, all subscriptions are handled via Lemon Squeezy merchant of record. You can pause, cancel, or modify your subscription with a single click from the customer portal. There are no lock-in contracts or cancellation penalties.',
  },
  {
    question: 'Is this platform fully transferable on Acquire.com?',
    answer:
      '100%. Verifyn is architected as a complete turnkey micro-SaaS with zero hardcoded credentials, an automated Supabase RLS database schema, Lemon Squeezy webhook handlers, and Dockerized deployment configurations ready for immediate handover.',
  },
];

export const PricingPage: React.FC<PricingPageProps> = ({
  profile,
  onOpenUpgradeModal,
  onStartSearch,
  onHandoverClick,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const featureMatrix = [
    { name: 'SEC Form 10-K & CIK Lookups', free: '3 Entities total', pro: 'Unlimited' },
    { name: 'Financial Revenue History (3-Year)', free: 'Included', pro: 'Included (10-Yr Ready)' },
    { name: 'Executive Officers & Leadership Roster', free: 'Included', pro: 'Included' },
    { name: 'Cap Table & 13F Institutional Holdings', free: 'Blurred Preview', pro: 'Full Unredacted Access' },
    { name: 'Gemini AI Forensic Risk & Red Flags', free: 'Locked', pro: 'Complete 0-100 Forensics' },
    { name: 'USPTO PatentsView Intellectual Property', free: 'First 2 Records', pro: 'Full Registry & Search' },
    { name: 'Competitor Peer Valuation Matrix', free: 'Locked', pro: 'Full Institutional Multiples' },
    { name: 'Institutional Due Diligence PDF Export', free: 'Locked', pro: 'Instant Vector PDF Report' },
    { name: 'Acquire.com Turnkey Codebase License', free: 'N/A', pro: 'Commercial Ready' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent Institutional Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          One Simple Plan for Elite Diligence.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-normal">
          Start auditing corporate entities immediately with 3 free credits. Upgrade to Pro for unlimited searches, Cap Tables, and AI forensic risk summaries.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 font-mono text-xs">
          <span className={billingCycle === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}>
            Monthly
          </span>
          <button
            id="pricing-billing-toggle-btn"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-12 h-6 rounded-full bg-slate-200 p-0.5 transition-colors relative cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-900 shadow-xs transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6 bg-emerald-600' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={billingCycle === 'annual' ? 'text-slate-900 font-bold' : 'text-slate-500'}>
              Annual
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Save 20%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch"
      >
        
        {/* Free Tier Card */}
        <GlassCard className="p-8 flex flex-col justify-between relative border border-slate-200/80 bg-white/75">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                Explorer Tier
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700 font-medium">
                Free Forever
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-slate-900">$0</span>
                <span className="text-xs text-slate-500 font-mono">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ideal for evaluating the platform and running quick exploratory checks.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/70 font-sans text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>3 Free Company Searches</strong> per session</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live SEC EDGAR 10-K & CIK Access</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3-Year Revenue & Net Income Charts</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Executive Officers Roster</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Cap Table & 13F Ownership (Locked)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Gemini AI 10-K Risk Forensics (Locked)</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={() => onStartSearch('TSLA')}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold text-xs transition-all hover:scale-[1.01] active:scale-[0.98] font-mono cursor-pointer"
            >
              Start Free Audits →
            </button>
          </div>
        </GlassCard>

        {/* Pro Tier Card (Highlighted) */}
        <GlassCard className="p-8 flex flex-col justify-between relative border-2 border-emerald-500/80 bg-white/90 shadow-xl">
          <div className="absolute -top-3.5 right-6 px-3.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-bold shadow-sm tracking-wide">
            RECOMMENDED FOR INVESTORS
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-700">
                Professional Diligence
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                Instant Turnkey
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-slate-900">
                  {billingCycle === 'monthly' ? '$9.99' : '$7.99'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {billingCycle === 'monthly' ? '/ month' : '/ mo (billed annually)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Full institutional forensics, unlimited public searches, and unredacted cap tables.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200/70 font-sans text-xs">
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited Instant Corporate Audits</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Cap Table & 13F Holdings Breakdown</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Gemini AI 10-K Risk Forensics & Scoring</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Full USPTO PatentsView Grant Registry</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Peer Valuation Multiple Benchmarks</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-900 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Print & PDF Diligence Memorandum Export</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              id="pricing-upgrade-cta-btn"
              onClick={onOpenUpgradeModal}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-emerald-600/25 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] font-mono cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>{profile.is_pro ? 'Pro Active (Manage Portal)' : 'Unlock Verifyn Pro ($9.99/mo)'}</span>
            </button>
          </div>
        </GlassCard>

      </motion.div>

      {/* Feature Comparison Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-4xl mx-auto pt-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 font-mono uppercase tracking-wider">
            Detailed Feature Comparison Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare capabilities across both subscription tiers
          </p>
        </div>

        <GlassCard className="p-0 overflow-hidden border border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                  <th className="py-3 px-6 font-semibold">Capability</th>
                  <th className="py-3 px-6 font-semibold text-center w-40">Free Explorer</th>
                  <th className="py-3 px-6 font-semibold text-center w-48 text-emerald-800 bg-emerald-50/50">
                    Verifyn Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {featureMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-6 text-center font-mono text-slate-500">{item.free}</td>
                    <td className="py-3.5 px-6 text-center font-mono font-bold text-emerald-700 bg-emerald-50/30">
                      {item.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Interactive FAQ Accordion with Smooth Motion Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-3xl mx-auto pt-6"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 font-mono uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Answers for analysts, hedge funds, and prospective SaaS acquirers
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <GlassCard
                key={idx}
                className="p-0 overflow-hidden border border-slate-200/80 bg-white/75"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>

      {/* Buyer Handover Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-4xl mx-auto pt-6"
      >
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
              Acquire.com Turnkey Handover
            </span>
            <h3 className="text-lg font-bold">Acquiring Verifyn for your portfolio?</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Zero paid API dependencies, Supabase RLS profiles, and Lemon Squeezy sandbox billing are packaged and ready for immediate domain transfer.
            </p>
          </div>
          <button
            onClick={onHandoverClick}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs font-mono transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer shadow-md"
          >
            Inspect Handover Spec →
          </button>
        </div>
      </motion.div>

    </div>
  );
};
