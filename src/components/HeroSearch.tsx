import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Sparkles, TrendingUp, ArrowUpRight, CheckCircle2, ShieldCheck, Building2, Globe, Command, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';

interface HeroSearchProps {
  currentQuery: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export type SearchFilterType = 'All' | 'Ticker' | 'Company' | 'Country';

interface SearchSuggestion {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
  exchange: string;
}

const AVAILABLE_SUGGESTIONS: SearchSuggestion[] = [
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Auto & Clean Tech', marketCap: '$682.4B', exchange: 'NASDAQ' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors & AI', marketCap: '$3.12T', exchange: 'NASDAQ' },
  { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Enterprise AI & Defense', marketCap: '$64.2B', exchange: 'NYSE' },
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Hardware & OS', marketCap: '$3.45T', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Cloud & Productivity', marketCap: '$3.28T', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-Commerce & AWS Cloud', marketCap: '$1.94T', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Search & AI Research', marketCap: '$2.15T', exchange: 'NASDAQ' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  currentQuery,
  onSearch,
  isLoading,
}) => {
  const [inputVal, setInputVal] = useState(currentQuery);
  const [filterType, setFilterType] = useState<SearchFilterType>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with currentQuery prop when changed externally
  useEffect(() => {
    setInputVal(currentQuery);
  }, [currentQuery]);

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete suggestions based on query
  const filteredSuggestions = AVAILABLE_SUGGESTIONS.filter((s) => {
    if (!inputVal.trim()) return true;
    const q = inputVal.toLowerCase().trim();
    if (filterType === 'Ticker') {
      return s.ticker.toLowerCase().includes(q);
    }
    if (filterType === 'Company') {
      return s.name.toLowerCase().includes(q);
    }
    return s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setShowSuggestions(false);
      onSearch(inputVal.trim());
    }
  };

  const handleSelectSuggestion = (ticker: string) => {
    setInputVal(ticker);
    setShowSuggestions(false);
    onSearch(ticker);
  };

  const trendingSearches = [
    {
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      sector: 'Automotive & Clean Tech',
      marketCap: '$682.4B',
      change: '+3.4%',
      status: 'SEC 10-K Verified',
      isHot: true,
    },
    {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      sector: 'Semiconductors & AI',
      marketCap: '$3.12T',
      change: '+5.1%',
      status: '13F Holdings Active',
      isHot: true,
    },
    {
      ticker: 'PLTR',
      name: 'Palantir Technologies',
      sector: 'Enterprise AI & Defense',
      marketCap: '$64.2B',
      change: '+2.8%',
      status: 'US Patent Registry',
      isHot: false,
    },
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Consumer Electronics',
      marketCap: '$3.45T',
      change: '+0.8%',
      status: 'Companies House Reg',
      isHot: false,
    },
  ];

  const filterOptions: { label: string; value: SearchFilterType; placeholder: string }[] = [
    { label: 'All Entities', value: 'All', placeholder: 'Search ticker (TSLA, NVDA) or corporate entity name...' },
    { label: 'Ticker Symbol', value: 'Ticker', placeholder: 'Enter stock ticker (e.g. TSLA, AAPL, PLTR)...' },
    { label: 'Company Name', value: 'Company', placeholder: 'Enter legal enterprise name (e.g. Microsoft)...' },
    { label: 'Country / Reg', value: 'Country', placeholder: 'Enter country jurisdiction (US, UK, DE)...' },
  ];

  const activeOption = filterOptions.find((f) => f.value === filterType) || filterOptions[0];

  return (
    <section className="relative w-full pt-8 pb-10 overflow-visible">
      
      {/* Dynamic Ambient Fluid Backdrops behind Frosted Glass */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full ambient-glow-pink blur-3xl pointer-events-none -z-10 opacity-75" />
      <div className="absolute top-1/4 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full ambient-glow-blue blur-3xl pointer-events-none -z-10 opacity-80" />
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[580px] h-64 rounded-full ambient-glow-emerald blur-3xl pointer-events-none -z-10 opacity-65" />

      <div className="max-w-4xl mx-auto text-center px-4 overflow-visible">
        
        {/* Animated Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/85 text-emerald-800 border border-emerald-200/80 shadow-xs backdrop-blur-md mb-4 font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Verifyn Studio Light • SEC EDGAR & PatentsView Live Hub</span>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none mb-3">
            Institutional Corporate Intelligence.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-7 font-normal leading-relaxed">
            Uncompromising forensic corporate audits, statutory 10-K disclosures, 13F ownership trees, and US patent indexing without expensive data subscriptions.
          </p>
        </motion.div>

        {/* Massive Translucent Glass Search Container with Interactive Autocomplete & Focus Effects */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className={`relative z-30 overflow-visible glass-search-container rounded-3xl p-3 sm:p-4 mb-8 max-w-3xl mx-auto text-left transition-all duration-300 ${
            isInputFocused
              ? 'scale-[1.01] ring-2 ring-emerald-500/35 border-white bg-white/95 shadow-2xl'
              : 'hover:shadow-lg'
          }`}
        >
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-center gap-2 overflow-visible">
            
            {/* Smart Filter Pill Dropdown */}
            <div className="relative shrink-0 w-full sm:w-auto z-40">
              <button
                type="button"
                id="search-filter-dropdown-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full sm:w-auto inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 border border-slate-200/90 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-400">By:</span>
                  <span className="text-slate-900">{activeOption.label}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 text-left">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setFilterType(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer ${
                        filterType === opt.value ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {filterType === opt.value && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar Wrapper Component */}
            <div className="relative w-full flex-1 z-30">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="hero-main-search-input"
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setIsInputFocused(true);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={activeOption.placeholder}
                  className="w-full pl-10 pr-14 py-2.5 bg-transparent rounded-2xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 border-0"
                />
                {inputVal && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setInputVal('');
                      setShowSuggestions(true);
                    }}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Auto-Complete Dropdown Container */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden max-h-[320px] overflow-y-auto divide-y divide-slate-100"
                  >
                    <div className="px-3.5 py-2 bg-slate-50/90 flex items-center justify-between text-[10px] font-mono text-slate-500 sticky top-0 z-10 backdrop-blur-md">
                      <span>INDEXED ENTITY AUTO-COMPLETE</span>
                      <span>Click to audit instantly</span>
                    </div>
                    {filteredSuggestions.map((item) => (
                      <div
                        key={item.ticker}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(item.ticker)}
                        className="p-3 hover:bg-slate-100/80 transition-colors cursor-pointer flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shrink-0">
                            {item.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                                ${item.ticker}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                {item.exchange}
                              </span>
                            </div>
                            <span className="text-xs text-slate-600 line-clamp-1">{item.name}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono text-xs shrink-0 ml-3">
                          <span className="font-bold text-slate-900 block">{item.marketCap}</span>
                          <span className="text-[10px] text-slate-400">{item.sector}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Action Button with Glow & Lift */}
            <button
              id="hero-main-search-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold text-xs rounded-2xl transition-all duration-200 shadow-md shadow-slate-900/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Scanning Registry...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Audit Entity</span>
                </>
              )}
            </button>
          </form>

          {/* Micro stats banner inside search container */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>10,000+ SEC Edgar CIKs Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Zero USPTO Key Required</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Gemini 1.5/3.8 Flash Audit</span>
            </div>
          </div>
        </motion.div>

        {/* Demo Ticker Quick Preview Chips */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs font-mono"
        >
          <span className="text-slate-400 text-xs">Popular Queries:</span>
          {['TSLA', 'NVDA', 'PLTR', 'AAPL', 'MSFT'].map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => handleSelectSuggestion(symbol)}
              className="px-3 py-1 rounded-xl bg-white/80 hover:bg-white hover:scale-105 active:scale-95 text-slate-700 hover:text-emerald-800 border border-slate-200 shadow-xs transition-all cursor-pointer font-bold"
            >
              ${symbol}
            </button>
          ))}
        </motion.div>

        {/* Featured Insights: Grid of Glass Cards with Scroll Reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-left relative z-10"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                Trending Searches & Major Valuations
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">Real-time statutory filings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {trendingSearches.map((item, idx) => (
              <motion.div
                key={item.ticker}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                id={`trending-card-${item.ticker}`}
                onClick={() => onSearch(item.ticker)}
                className="glass-card glass-card-interactive p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-extrabold font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                      ${item.ticker}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {item.change}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.sector}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-slate-700">{item.marketCap}</span>
                  <span className="text-slate-400 group-hover:text-slate-700 flex items-center gap-0.5 transition-colors">
                    <span>Audit</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
};
