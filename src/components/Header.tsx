import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Zap, Coins, Info, Mail, LayoutDashboard, CreditCard, LogIn, LogOut, User } from 'lucide-react';
import { UserProfile, AuthUser } from '../types';

export type ActivePage = 'search' | 'dashboard' | 'pricing' | 'about' | 'contact' | 'privacy' | 'terms' | 'auth-callback';

interface HeaderProps {
  currentQuery: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
  profile: UserProfile;
  user: AuthUser | null;
  onOpenUpgradeModal: () => void;
  onOpenAuthModal: (mode?: 'signup' | 'login') => void;
  onSignOut: () => void;
  onOpenHandoverModal?: () => void;
  onTogglePro?: () => void;
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentQuery,
  onSearch,
  isLoading,
  profile,
  user,
  onOpenUpgradeModal,
  onOpenAuthModal,
  onSignOut,
  activePage,
  onNavigate,
}) => {
  const [inputVal, setInputVal] = useState(currentQuery);

  useEffect(() => {
    setInputVal(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
      if (activePage !== 'search' && activePage !== 'dashboard') {
        onNavigate('dashboard');
      }
    }
  };

  const quickPills = ['TSLA', 'NVDA', 'PLTR', 'AAPL', 'MSFT'];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav backdrop-blur-md bg-white/70 border-b border-slate-200/50 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('search')}
            className="flex items-center shrink-0 cursor-pointer group select-none"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-900 font-mono group-hover:text-emerald-600 transition-colors">
                  VERIFYN
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[10px] text-slate-500 tracking-tight font-medium hidden sm:inline">
                Corporate Intelligence
              </span>
            </div>
          </div>

          {/* Main Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/70 font-mono text-xs backdrop-blur-md">
            <button
              id="nav-tab-search"
              onClick={() => onNavigate('search')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activePage === 'search'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Hub</span>
            </button>

            <button
              id="nav-tab-dashboard"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activePage === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Diligence View</span>
            </button>

            <button
              id="nav-tab-pricing"
              onClick={() => onNavigate('pricing')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activePage === 'pricing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pricing ($9.99)</span>
            </button>

            <button
              id="nav-tab-about"
              onClick={() => onNavigate('about')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activePage === 'about'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About Us</span>
            </button>

            <button
              id="nav-tab-contact"
              onClick={() => onNavigate('contact')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                activePage === 'contact'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Us</span>
            </button>
          </nav>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-xs hidden lg:block">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="header-search-input"
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Quick ticker search..."
                  className="w-full pl-8 pr-16 py-1.5 bg-slate-100/70 border border-slate-200 focus:border-emerald-500/80 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono"
                />
                <button
                  id="header-search-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-1 px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-[11px] font-semibold text-white rounded-lg transition-all cursor-pointer"
                >
                  {isLoading ? '...' : 'Scan'}
                </button>
              </div>
            </form>
          </div>

          {/* User Status & Auth Actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            {user ? (
              <>
                {/* Credits / Pro Pill */}
                {profile.is_pro ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">PRO UNLIMITED</span>
                    <span className="sm:hidden">PRO</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{profile.credits}/3 Credits</span>
                  </div>
                )}

                {/* Upgrade CTA */}
                {!profile.is_pro && (
                  <button
                    id="header-upgrade-cta-btn"
                    onClick={onOpenUpgradeModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white transition-all shadow-sm shadow-emerald-600/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span className="hidden sm:inline">Upgrade</span>
                    <span>$9.99</span>
                  </button>
                )}

                {/* Authenticated User Pill & Sign Out */}
                <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                    {user.name ? user.name[0] : (user.email ? user.email[0] : 'U')}
                  </div>
                  <span className="text-xs font-mono text-slate-600 max-w-[110px] truncate" title={user.email}>
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>

                <button
                  id="header-signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  id="header-signin-btn"
                  onClick={() => onOpenAuthModal('login')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>

                <button
                  id="header-signup-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] text-white transition-all shadow-xs cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sign Up Free</span>
                </button>
              </>
            )}

          </div>

        </div>

        {/* Mobile Page Tabs + Quick Ticker Switcher */}
        <div className="flex items-center justify-between gap-2 pb-2.5 pt-1 overflow-x-auto text-xs scrollbar-none border-t border-slate-200/50 md:border-t-0">
          
          {/* Mobile nav buttons */}
          <div className="flex md:hidden items-center gap-1 shrink-0 font-mono text-[11px]">
            <button
              onClick={() => onNavigate('search')}
              className={`px-2 py-0.5 rounded-lg font-medium ${
                activePage === 'search' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-2 py-0.5 rounded-lg font-medium ${
                activePage === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Diligence
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className={`px-2 py-0.5 rounded-lg font-medium ${
                activePage === 'pricing' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`px-2 py-0.5 rounded-lg font-medium ${
                activePage === 'about' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`px-2 py-0.5 rounded-lg font-medium ${
                activePage === 'contact' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Quick Tickers */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-slate-400 text-[11px] font-mono shrink-0 hidden sm:inline">Track:</span>
            {quickPills.map((ticker) => (
              <button
                key={ticker}
                id={`quick-ticker-${ticker}`}
                onClick={() => {
                  onSearch(ticker);
                  if (activePage !== 'search' && activePage !== 'dashboard') {
                    onNavigate('dashboard');
                  }
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer ${
                  currentQuery.toUpperCase() === ticker
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/60'
                }`}
              >
                ${ticker}
              </button>
            ))}
          </div>

        </div>

      </div>
    </header>
  );
};
