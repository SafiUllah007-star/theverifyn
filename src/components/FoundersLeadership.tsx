import React from 'react';
import { Users2, UserCheck } from 'lucide-react';
import { Executive } from '../types';
import { GlassCard } from './GlassCard';

interface FoundersLeadershipProps {
  leadership: Executive[];
  employeeCount: number;
  headcountGrowthYoY: number;
}

export const FoundersLeadership: React.FC<FoundersLeadershipProps> = ({
  leadership,
  employeeCount,
  headcountGrowthYoY,
}) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Leadership & Key Executives
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              Unrestricted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified officers from SEC Form 10-K & DEF 14A proxy disclosures
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 shadow-xs">
          <Users2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-bold">{employeeCount.toLocaleString()} Team</span>
        </div>
      </div>

      {/* Leadership Roster */}
      <div className="divide-y divide-slate-100 my-2">
        {leadership.map((exec, idx) => (
          <div key={idx} className="px-2 py-3 rounded-xl flex items-center justify-between gap-3 group hover:bg-slate-100/70 transition-all duration-200 cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold font-mono text-slate-900 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors shadow-xs">
                {exec.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {exec.name}
                  </h4>
                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 font-semibold">
                      Chief
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">{exec.title}</p>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-slate-800 font-bold block">{exec.tenure}</span>
              {exec.previousCompany && (
                <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                  ex-{exec.previousCompany}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Headcount Stat Footer */}
      <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>YoY Headcount Expansion:</span>
        </div>
        <span className="font-mono font-bold text-emerald-700">
          +{headcountGrowthYoY}% statutory verified
        </span>
      </div>
    </GlassCard>
  );
};
