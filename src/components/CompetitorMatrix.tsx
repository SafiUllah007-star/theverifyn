import React from 'react';
import { Scale } from 'lucide-react';
import { CompetitorMetric } from '../types';
import { GlassCard } from './GlassCard';

interface CompetitorMatrixProps {
  competitors: CompetitorMetric[];
  currentSymbol: string;
}

export const CompetitorMatrix: React.FC<CompetitorMatrixProps> = ({
  competitors,
  currentSymbol,
}) => {
  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'B':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'C':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-50 text-rose-800 border-rose-300';
    }
  };

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Competitor & Peer Valuation Matrix
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold border border-amber-300">
              PRO INTEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-industry multiples and forensic AI risk ratings (Yahoo Finance normalized)
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
          <Scale className="w-3.5 h-3.5 text-slate-400" />
          <span>Sector Benchmarks</span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200/80 text-[11px]">
              <th className="pb-2 font-semibold font-sans">Peer Enterprise</th>
              <th className="pb-2 font-semibold text-right">EV / Revenue</th>
              <th className="pb-2 font-semibold text-right">P/E Multiple</th>
              <th className="pb-2 font-semibold text-right">Gross Margin</th>
              <th className="pb-2 font-semibold text-right">R&D / Rev %</th>
              <th className="pb-2 font-semibold text-center">AI Risk Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {competitors.map((peer) => (
              <tr key={peer.ticker} className="hover:bg-slate-100/70 transition-all duration-200 cursor-default">
                <td className="py-2.5 pr-2 font-sans font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-mono font-bold">${peer.ticker}</span>
                    <span className="text-slate-500 text-xs truncate max-w-[140px] font-normal">
                      {peer.name}
                    </span>
                  </div>
                </td>

                <td className="py-2.5 pr-2 text-right text-slate-700 font-medium">
                  {peer.evToRevenue.toFixed(1)}x
                </td>

                <td className="py-2.5 pr-2 text-right text-slate-700 font-medium">
                  {peer.peRatio > 0 ? `${peer.peRatio.toFixed(1)}x` : 'N/A (Loss)'}
                </td>

                <td className="py-2.5 pr-2 text-right text-emerald-700 font-bold">
                  {peer.grossMargin > 0 ? `+${peer.grossMargin.toFixed(1)}%` : `${peer.grossMargin.toFixed(1)}%`}
                </td>

                <td className="py-2.5 pr-2 text-right text-slate-500 font-medium">
                  {peer.rdRatio.toFixed(1)}%
                </td>

                <td className="py-2.5 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs ${getGradeBadge(
                      peer.aiRiskGrade
                    )}`}
                  >
                    {peer.aiRiskGrade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Methodology: Enterprise Value / NTM Consensus</span>
        <span className="text-emerald-700 font-bold">Market Risk Dispersion: Moderate</span>
      </div>
    </GlassCard>
  );
};
