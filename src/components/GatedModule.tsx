import React from 'react';
import { Lock, Sparkles, Zap, Loader2 } from 'lucide-react';

interface GatedModuleProps {
  isPro: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  onUpgradeClick: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
  skeleton?: React.ReactNode;
}

export const GatedModule: React.FC<GatedModuleProps> = ({
  isPro,
  title,
  subtitle,
  badge = 'PRO TIER',
  onUpgradeClick,
  children,
  isLoading = false,
  skeleton,
}) => {
  // If user is Pro, render either the custom skeleton or the children (which may self-render a skeleton)
  if (isPro) {
    if (isLoading && skeleton) {
      return <>{skeleton}</>;
    }
    return <>{children}</>;
  }

  // Active content for the preview layer (skeleton while loading, populated children when ready)
  const previewContent = isLoading && skeleton ? skeleton : children;

  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Blurred preview layer with active skeleton or data */}
      <div className="filter blur-[6px] select-none pointer-events-none opacity-40 transition-all duration-300">
        {previewContent}
      </div>

      {/* Studio Light Frosted Glass Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/75 backdrop-blur-xl border border-white/80 rounded-2xl text-center shadow-lg shadow-slate-200/50">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-500 mb-3 shadow-md">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300 mb-2 font-mono shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-600" />
          {badge}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
          Unlock {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
            {subtitle}
          </p>
        )}

        {isLoading && (
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono border border-emerald-500/30 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Scanning SEC EDGAR filings for {title}...</span>
          </div>
        )}

        <button
          id={`upgrade-gate-btn-${title.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onUpgradeClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-md shadow-slate-900/20 active:scale-95 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          Upgrade to Pro ($9.99/mo)
        </button>
      </div>
    </div>
  );
};

