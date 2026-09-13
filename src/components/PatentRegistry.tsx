import React, { useState } from 'react';
import { Lightbulb, Tag } from 'lucide-react';
import { PatentItem } from '../types';
import { GlassCard } from './GlassCard';

interface PatentRegistryProps {
  patents: PatentItem[];
  companyName: string;
}

export const PatentRegistry: React.FC<PatentRegistryProps> = ({ patents, companyName }) => {
  const [filter, setFilter] = useState('');

  const filtered = patents.filter(
    (p) =>
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toLowerCase().includes(filter.toLowerCase()) ||
      p.classification.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              US Patent & Trademark Registry
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold border border-amber-300">
              PRO INTEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct query to PatentsView Open REST API (Zero USPTO key required)
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter patents..."
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 font-mono w-44 shadow-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200/80 font-mono text-[11px]">
              <th className="pb-2 font-semibold">Patent Number</th>
              <th className="pb-2 font-semibold">Invention Title & Abstract</th>
              <th className="pb-2 font-semibold">Classification</th>
              <th className="pb-2 font-semibold">Filing / Grant</th>
              <th className="pb-2 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((patent) => (
              <tr key={patent.id} className="hover:bg-slate-100/70 transition-all duration-200 group cursor-default">
                <td className="py-3 pr-3 font-mono font-bold text-emerald-700 whitespace-nowrap align-top">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span>{patent.id}</span>
                  </div>
                </td>

                <td className="py-3 pr-3 align-top max-w-md">
                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors mb-1 text-xs">
                    {patent.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-sans">
                    {patent.abstractSnippet}
                  </p>
                </td>

                <td className="py-3 pr-3 font-mono text-[11px] text-slate-500 align-top whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{patent.classification.split(' ')[0]}</span>
                  </div>
                </td>

                <td className="py-3 pr-3 font-mono text-[11px] text-slate-700 align-top whitespace-nowrap">
                  <div>F: {patent.filingDate}</div>
                  <div className="text-slate-400">G: {patent.grantDate}</div>
                </td>

                <td className="py-3 text-right align-top whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      patent.status === 'Granted'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {patent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Assigned Entity: <strong className="text-slate-800">{companyName}</strong></span>
        <span>Total Filings Indexed: <strong className="text-slate-800">{patents.length}</strong></span>
      </div>
    </GlassCard>
  );
};
