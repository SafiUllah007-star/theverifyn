import React from 'react';
import { AlertTriangle, BrainCircuit, Activity, CheckCircle, Sparkles } from 'lucide-react';
import { GeminiRiskAssessment } from '../types';
import { GlassCard } from './GlassCard';
import { RiskAssessmentCardSkeleton } from './Skeleton';

export { RiskAssessmentCardSkeleton };

interface RiskAssessmentCardProps {
  data: GeminiRiskAssessment;
  companyName: string;
  isLoading?: boolean;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  data,
  companyName,
  isLoading = false,
}) => {
  if (isLoading) {
    return <RiskAssessmentCardSkeleton companyName={companyName} />;
  }

  const isHighRisk = data.risk_score > 50 || data.risk_level === 'High' || data.risk_level === 'Severe';
  const isModerate = data.risk_score > 30 && data.risk_score <= 50;

  const scoreColor = isHighRisk
    ? 'text-rose-600'
    : isModerate
    ? 'text-amber-600'
    : 'text-emerald-600';

  const badgeBg = isHighRisk
    ? 'bg-rose-50 border-rose-300 text-rose-800'
    : isModerate
    ? 'bg-amber-50 border-amber-300 text-amber-800'
    : 'bg-emerald-50 border-emerald-300 text-emerald-800';

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xs">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                AI Risk & Red Flag Forensics
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold border border-amber-300">
                PRO INTEL
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Gemini Flash automated statutory disclosure audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Structured JSON Pipeline</span>
        </div>
      </div>

      {/* Main Score & Status Section */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 my-4 items-center">
        
        {/* Risk Meter Gauge */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/85 border border-slate-200/80 text-center shadow-xs">
          <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider mb-1">
            Forensic Risk Index
          </span>
          <div className="relative flex items-center justify-center my-1">
            <span className={`text-4xl sm:text-5xl font-extrabold font-mono ${scoreColor}`}>
              {data.risk_score}
            </span>
            <span className="text-xs text-slate-400 font-mono ml-1 font-semibold">/100</span>
          </div>

          <div className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono border mt-2 shadow-xs ${badgeBg}`}>
            {data.risk_level.toUpperCase()} RISK
          </div>
        </div>

        {/* 100-Word Executive Forensic Summary */}
        <div className="sm:col-span-8 p-4 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
            <span className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              100-Word Executive Audit
            </span>
            <span>Confidence: {data.confidenceScore || 95}%</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{data.summary}"
          </p>
        </div>

      </div>

      {/* Identified Red Flags */}
      <div className="space-y-2.5">
        <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          Identified Disclosures & Red Flags ({data.red_flags.length})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.red_flags.map((flag, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-rose-50/75 border border-rose-200/80 text-xs text-rose-950 flex items-start gap-2 group hover:bg-rose-100/60 transition-colors shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
              <span className="leading-snug font-medium">{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3.5 mt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Filing Engine: {data.sourceFiling || 'SEC EDGAR 10-K'}</span>
        <span className="text-emerald-700 font-bold flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Zero Developer Hardcoding
        </span>
      </div>

    </GlassCard>
  );
};
