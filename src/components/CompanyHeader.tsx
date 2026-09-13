import React from 'react';
import { Building2, FileText, CheckCircle2, Download, ExternalLink, Calendar, MapPin, User, ArrowUpRight } from 'lucide-react';
import { CompanyIntelligence } from '../types';
import { GlassCard } from './GlassCard';

interface CompanyHeaderProps {
  data: CompanyIntelligence;
  isPro: boolean;
  onExportPdf: () => void;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({ data, isPro, onExportPdf }) => {
  return (
    <GlassCard className="mb-6 p-6 sm:p-7">
      
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
            ${data.symbol}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {data.exchange}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            SEC EDGAR Active
          </span>
          <span className="text-xs text-slate-500 font-mono">
            CIK: <span className="text-slate-800 font-bold">{data.cik}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <a
            href={data.secEdgarRecentFiling.reportUrl || `https://www.sec.gov/edgar/browse/?CIK=${data.cik}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>SEC Filing</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            id="company-header-pdf-export-btn"
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export Memorandum</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        
        {/* Left: Brand Identity & Metadata */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5">
              {data.companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">{data.sector}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{data.industry}</span>
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 font-mono">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chief Executive</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{data.ceo}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Global HQ</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{data.hqLocation}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Incorporation</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{data.incorporationDate}</p>
            </div>
          </div>

          {/* Subsidiary / Companies House cross-reference */}
          {data.companiesHouseReg && (
            <div className="flex items-center gap-2 text-xs text-slate-600 pt-1 font-mono">
              <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>UK Companies House: #{data.companiesHouseReg.companyNumber} ({data.companiesHouseReg.status})</span>
            </div>
          )}
        </div>

        {/* Right: Key Valuation & Scale Metrics in Frosted Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 self-center">
          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-1">Market Cap</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 tracking-tight">{data.marketCapFormatted}</span>
            <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Live Equity
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-1">Enterprise Value</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-800 tracking-tight">{data.enterpriseValueFormatted}</span>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">EV (Debt + Cash)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-1">Total Headcount</span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 tracking-tight">{data.employeeCount.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-700 font-mono font-semibold block mt-1">
              +{data.headcountGrowthYoY}% YoY Growth
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block mb-1">Recent SEC Filing</span>
            <span className="text-sm font-bold text-slate-900 block truncate">{data.secEdgarRecentFiling.form}</span>
            <span className="text-[11px] font-mono text-slate-500 block mt-1">{data.secEdgarRecentFiling.filingDate}</span>
          </div>
        </div>

      </div>
    </GlassCard>
  );
};
