import React from 'react';
import { GlassCard } from './GlassCard';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-shimmer bg-slate-200/80 rounded-md ${className}`}
      {...props}
    />
  );
};

export const CapTableSkeleton: React.FC<{ symbol?: string }> = ({ symbol = 'TICKER' }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top subtle scan beam effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent animate-shimmer" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-48 sm:w-60 rounded-md" />
            <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800/60 font-semibold border border-amber-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>PRO INTEL</span>
            </div>
          </div>
          <Skeleton className="h-3 w-72 max-w-full rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-500">
            <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
            <span>Parsing 13F filings...</span>
          </div>
        </div>
      </div>

      {/* Visual Ownership Bar Skeleton */}
      <div className="my-4 space-y-2.5">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 inline-block animate-pulse" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 inline-block animate-pulse" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400/40 inline-block animate-pulse" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>

        {/* Stacked Progress Bar Skeleton */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
          <div className="w-[58%] h-full bg-emerald-500/30 animate-shimmer" />
          <div className="w-[18%] h-full bg-amber-500/30 animate-shimmer" />
          <div className="w-[24%] h-full bg-slate-300/60 animate-shimmer" />
        </div>
      </div>

      {/* Top Holders Table Skeleton */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-200/80 font-mono text-[11px]">
              <th className="pb-2 font-semibold">Major Shareholder</th>
              <th className="pb-2 font-semibold">Classification</th>
              <th className="pb-2 font-semibold text-right">Shares Held</th>
              <th className="pb-2 font-semibold text-right">Equity %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {[
              { wName: 'w-36', wType: 'w-20', wShares: 'w-16', wPct: 'w-10' },
              { wName: 'w-44', wType: 'w-16', wShares: 'w-20', wPct: 'w-12' },
              { wName: 'w-32', wType: 'w-20', wShares: 'w-14', wPct: 'w-10' },
              { wName: 'w-40', wType: 'w-16', wShares: 'w-18', wPct: 'w-12' },
            ].map((row, idx) => (
              <tr key={idx} className="py-2.5">
                <td className="py-2.5 pr-2">
                  <Skeleton className={`h-3.5 ${row.wName} rounded`} />
                </td>
                <td className="py-2.5 pr-2">
                  <Skeleton className={`h-4 ${row.wType} rounded-full`} />
                </td>
                <td className="py-2.5 pr-2 text-right flex justify-end">
                  <Skeleton className={`h-3.5 ${row.wShares} rounded`} />
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex justify-end">
                    <Skeleton className={`h-3.5 ${row.wPct} rounded font-bold`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Note Skeleton */}
      <div className="pt-3.5 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <Skeleton className="h-3 w-48 rounded" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    </GlassCard>
  );
};

export const RiskAssessmentCardSkeleton: React.FC<{ companyName?: string }> = ({
  companyName = 'Company',
}) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Top subtle scan beam effect */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-shimmer" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-emerald-400/80 shadow-xs">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-44 sm:w-56 rounded-md" />
              <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800/60 font-semibold border border-amber-200/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>PRO INTEL</span>
              </div>
            </div>
            <Skeleton className="h-3 w-56 max-w-full rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Gemini AI Auditing...</span>
        </div>
      </div>

      {/* Main Score & Status Section Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 my-4 items-center">
        {/* Risk Meter Gauge Skeleton */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/85 border border-slate-200/80 text-center shadow-xs">
          <Skeleton className="h-3 w-28 rounded mb-2" />
          <div className="relative flex items-center justify-center my-1">
            <Skeleton className="h-11 w-20 rounded-xl" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full mt-2" />
        </div>

        {/* 100-Word Executive Forensic Summary Skeleton */}
        <div className="sm:col-span-8 p-4 rounded-2xl bg-white/85 border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono mb-2">
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-11/12 rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </div>
      </div>

      {/* Identified Red Flags Skeleton */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-4 rounded-full" />
          <Skeleton className="h-3.5 w-64 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 flex items-start gap-2 shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0 animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Skeleton */}
      <div className="pt-3.5 mt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <Skeleton className="h-3 w-44 rounded" />
        <Skeleton className="h-3 w-36 rounded" />
      </div>
    </GlassCard>
  );
};
