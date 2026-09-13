import React from 'react';
import { CapTableData } from '../types';
import { GlassCard } from './GlassCard';
import { CapTableSkeleton } from './Skeleton';

export { CapTableSkeleton };

interface CapTableProps {
  data: CapTableData;
  symbol: string;
  isLoading?: boolean;
}

export const CapTable: React.FC<CapTableProps> = ({ data, symbol, isLoading = false }) => {
  if (isLoading) {
    return <CapTableSkeleton symbol={symbol} />;
  }

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Cap Table & Ownership Concentration
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold border border-amber-300">
              PRO INTEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional vs. Insider Equity Concentration (SEC Form 13F & Schedule 13D)
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Source: SEC 13F Q-Filings
        </span>
      </div>

      {/* Visual Ownership Bar */}
      <div className="my-4">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-slate-700 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block"></span>
            Institutional ({data.institutionalPct}%)
          </span>
          <span className="text-slate-700 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            Insiders ({data.insiderPct}%)
          </span>
          <span className="text-slate-700 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block"></span>
            Public Float ({data.publicFloatPct}%)
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
          <div
            style={{ width: `${data.institutionalPct}%` }}
            className="bg-emerald-600 transition-all duration-500"
            title={`Institutional: ${data.institutionalPct}%`}
          />
          <div
            style={{ width: `${data.insiderPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Insiders: ${data.insiderPct}%`}
          />
          <div
            style={{ width: `${data.publicFloatPct}%` }}
            className="bg-slate-400 transition-all duration-500"
            title={`Public Float: ${data.publicFloatPct}%`}
          />
        </div>
      </div>

      {/* Top Holders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200/80 font-mono text-[11px]">
              <th className="pb-2 font-semibold">Major Shareholder</th>
              <th className="pb-2 font-semibold">Classification</th>
              <th className="pb-2 font-semibold text-right">Shares Held</th>
              <th className="pb-2 font-semibold text-right">Equity %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {data.topShareholders.map((holder, idx) => (
              <tr key={idx} className="hover:bg-slate-100/70 transition-all duration-200 cursor-default">
                <td className="py-2.5 pr-2 font-sans font-bold text-slate-800">
                  {holder.name}
                </td>
                <td className="py-2.5 pr-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      holder.type === 'Insider'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {holder.type}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-right text-slate-600 font-medium">
                  {holder.shares}
                </td>
                <td className="py-2.5 text-right font-bold text-slate-900">
                  {holder.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Note */}
      <div className="pt-3.5 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Voting Rights: Standard Common Class A</span>
        <span className="text-emerald-700 font-bold">Institutional Moat: Solid</span>
      </div>
    </GlassCard>
  );
};
