import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, ActivePage } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { PricingPage } from './components/PricingPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { CompanyHeader } from './components/CompanyHeader';
import { RevenueChart } from './components/RevenueChart';
import { FoundersLeadership } from './components/FoundersLeadership';
import { GatedModule } from './components/GatedModule';
import { CapTable } from './components/CapTable';
import { RiskAssessmentCard } from './components/RiskAssessmentCard';
import { CapTableSkeleton, RiskAssessmentCardSkeleton } from './components/Skeleton';
import { PatentRegistry } from './components/PatentRegistry';
import { CompetitorMatrix } from './components/CompetitorMatrix';
import { GlassCard } from './components/GlassCard';
import { UpgradeModal } from './components/UpgradeModal';
import { HandoverModal } from './components/HandoverModal';
import { ExportPdfModal } from './components/ExportPdfModal';
import { FEATURED_COMPANIES } from './data/mockCompanies';
import { CompanyIntelligence, UserProfile, AuthUser } from './types';
import { fetchUserProfile, getActiveAuthSession, signOutUser, configureClientSupabase, clientSupabase, syncUserProfileWithServer } from './lib/supabase';
import { getDeviceFingerprint } from './lib/fingerprint';
import { AuthModal } from './components/AuthModal';
import { AuthCallback } from './components/AuthCallback';
import {
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Database,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Quote,
  LayoutDashboard,
  ExternalLink,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<CompanyIntelligence>(FEATURED_COMPANIES.TSLA);
  const [query, setQuery] = useState('TSLA');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('search');

  // Supabase Authenticated User Session
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('verifyn_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user?.id) {
          return parsed.user;
        }
      }
    } catch (e) {
      console.warn('Could not read cached auth session:', e);
    }
    return null;
  });

  // Profile state synced with Supabase public.profiles table
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const cached = localStorage.getItem('verifyn_user_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.credits === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached profile:', e);
    }
    return {
      id: 'unauthenticated',
      email: '',
      credits: 0,
      is_pro: false,
    };
  });

  // Modal visibility states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Authentication Wall Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signup' | 'login'>('signup');
  const [authModalSubtitle, setAuthModalSubtitle] = useState<string | undefined>(undefined);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);

  // Trigger Auth Wall Modal & strictly route to /login for unauthenticated gate
  const triggerAuthWall = (
    mode: 'signup' | 'login' = 'login',
    subtitle?: string,
    pendingQuery?: string
  ) => {
    setAuthModalMode(mode);
    setAuthModalSubtitle(subtitle || 'Sign in to access corporate intelligence dossiers and diligence tools.');
    if (pendingQuery) {
      setPendingSearchQuery(pendingQuery);
    }
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/signup') {
      window.history.pushState({}, '', mode === 'signup' ? '/signup' : '/login');
    }
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
      window.history.replaceState({}, '', '/');
    }
  };

  // Synchronize profile state to localStorage whenever it changes
  useEffect(() => {
    if (profile && profile.id !== 'unauthenticated') {
      try {
        localStorage.setItem('verifyn_user_profile', JSON.stringify(profile));
      } catch (e) {
        // ignore
      }
    }
  }, [profile]);

  // Sync Supabase Auth session & dynamic auth configuration on mount
  useEffect(() => {
    fetch('/api/auth/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          configureClientSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey);
        }
      })
      .catch((err) => console.warn('Could not fetch auth config:', err));

    getActiveAuthSession().then((session) => {
      if (session?.user) {
        setUser(session.user);
        setProfile(session.profile);
        localStorage.setItem('verifyn_user_profile', JSON.stringify(session.profile));
      }
    });

    if (clientSupabase) {
      const { data: { subscription } } = clientSupabase.auth.onAuthStateChange(async (event, sbSession) => {
        if (sbSession?.user) {
          const u = sbSession.user;
          const meta = u.user_metadata || {};
          const email = u.email || meta.email || '';
          const name = meta.full_name || meta.name || meta.given_name || (email ? email.split('@')[0] : 'User');
          const avatarUrl = meta.avatar_url || meta.picture;
          const authUser: AuthUser = {
            id: u.id,
            email,
            name,
            avatar_url: avatarUrl,
            provider: u.app_metadata?.provider || 'google',
          };
          let p = await fetchUserProfile(u.id);
          if (!p) {
            p = await syncUserProfileWithServer(authUser);
          }
          const userProfile: UserProfile = p || {
            id: u.id,
            email,
            credits: 3,
            is_pro: false,
          };
          setUser(authUser);
          setProfile(userProfile);
          localStorage.setItem('verifyn_auth_session', JSON.stringify({ user: authUser, profile: userProfile }));
          localStorage.setItem('verifyn_user_profile', JSON.stringify(userProfile));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile({ id: 'unauthenticated', email: '', credits: 0, is_pro: false });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Listen for cross-window OAuth success message from popups
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { user: authUser, profile: authProfile } = event.data;
        if (authUser && authProfile) {
          handleAuthSuccess(authUser, authProfile);
          setActivePage('dashboard');
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Sync initial URL path & Enforce Authentication Protection
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const cachedRaw = localStorage.getItem('verifyn_auth_session');
      const isAuthenticated = Boolean(user || cachedRaw);

      // Check if URL represents an Auth Callback or verification redirect (e.g. /auth/callback, or hash/query with otp_expired or code)
      const isAuthCallback =
        path === '/auth/callback' ||
        path.startsWith('/auth/callback') ||
        hash.includes('error_code=') ||
        hash.includes('access_token=') ||
        hash.includes('error=') ||
        search.includes('error_code=') ||
        search.includes('code=');

      if (isAuthCallback) {
        setActivePage('auth-callback');
        return;
      } else if (path === '/signup') {
        setActivePage('search');
        triggerAuthWall('signup', 'Create a free corporate account to receive 3 intelligence search credits.');
      } else if (path === '/login') {
        setActivePage('search');
        triggerAuthWall('login', 'Sign in to access your intelligence dossier and credits.');
      } else if (path === '/pricing') {
        setActivePage('pricing');
      } else if (path === '/about') {
        setActivePage('about');
      } else if (path === '/contact') {
        setActivePage('contact');
      } else if (path === '/privacy') {
        setActivePage('privacy');
      } else if (path === '/terms') {
        setActivePage('terms');
      } else if (path.startsWith('/dashboard')) {
        // Auto-Redirect: Unauthenticated users are strictly redirected to /login when attempting to access gated routes or tools
        if (!isAuthenticated) {
          setActivePage('search');
          window.history.replaceState({}, '', '/login');
          triggerAuthWall(
            'login',
            'Corporate intelligence data requires an authenticated account. Please sign in to view dossiers and diligence tools.'
          );
          return;
        }

        setActivePage('dashboard');
        const symbolInPath = path.split('/')[2];
        if (symbolInPath) {
          const clean = symbolInPath.toUpperCase().trim();
          if (FEATURED_COMPANIES[clean]) {
            setData(FEATURED_COMPANIES[clean]);
            setQuery(clean);
          }
        }
      } else {
        setActivePage('search');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [user]);

  // Handle successful sign in / sign up
  const handleAuthSuccess = (authUser: AuthUser, authProfile: UserProfile) => {
    setUser(authUser);
    setProfile(authProfile);
    localStorage.setItem('verifyn_auth_session', JSON.stringify({ user: authUser, profile: authProfile }));
    localStorage.setItem('verifyn_user_profile', JSON.stringify(authProfile));
    setIsAuthModalOpen(false);

    // If a search was pending authentication, execute it immediately
    if (pendingSearchQuery) {
      const q = pendingSearchQuery;
      setPendingSearchQuery(null);
      executeSearch(q, authUser.id);
    } else {
      if (activePage === 'search' && data && data.symbol) {
        setActivePage('dashboard');
        window.history.replaceState({}, '', `/dashboard/${data.symbol}`);
      } else {
        const dest = (window.location.pathname === '/login' || window.location.pathname === '/signup') ? '/' : window.location.pathname;
        window.history.replaceState({}, '', dest);
      }
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setProfile({
      id: 'unauthenticated',
      email: '',
      credits: 0,
      is_pro: false,
    });
    localStorage.removeItem('verifyn_auth_session');
    localStorage.removeItem('verifyn_user_profile');
    setActivePage('search');
    window.history.pushState({}, '', '/login');
  };

  const handleNavigate = (page: ActivePage) => {
    // Auth Guard on Dashboard navigation: strictly redirect unauthenticated users to /login
    if (page === 'dashboard' && !user) {
      window.history.pushState({}, '', '/login');
      triggerAuthWall(
        'login',
        'Viewing corporate intelligence dossiers and diligence tools requires an authenticated account. Please sign in to continue.'
      );
      return;
    }

    setActivePage(page);
    let path = '/';
    if (page === 'dashboard') path = `/dashboard/${data.symbol}`;
    else if (page !== 'search') path = `/${page}`;
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search trigger: strictly guards unauthenticated users and redirects to /login
  const handleSearch = (newQuery: string) => {
    if (!user) {
      window.history.pushState({}, '', '/login');
      triggerAuthWall(
        'login',
        `Please sign in or create an account to audit ${newQuery.toUpperCase()} and access your 3 free credits.`,
        newQuery
      );
      return;
    }
    executeSearch(newQuery, user.id);
  };

  // Core Search Execution Routine (POST /api/search)
  const executeSearch = async (newQuery: string, activeUserId: string) => {
    setIsLoading(true);
    setSearchError(null);
    setQuery(newQuery);

    // Switch to dashboard view immediately so user sees skeleton loading states while results populate
    if (activePage === 'search') {
      setActivePage('dashboard');
      window.history.pushState({}, '', `/dashboard/${newQuery.trim().toUpperCase()}`);
    }

    try {
      const visitorId = await getDeviceFingerprint();
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId,
          'x-user-id': activeUserId,
          'Authorization': `Bearer ${activeUserId}`,
        },
        body: JSON.stringify({
          query: newQuery,
          userId: activeUserId,
          visitorId,
        }),
      });

      const json = await response.json();

      // Auth middleware check
      if (response.status === 401 || json.triggerAuth || json.error === 'UNAUTHENTICATED') {
        triggerAuthWall('login', json.message || 'Authentication required to execute searches.', newQuery);
        return;
      }

      if (
        response.status === 403 ||
        response.status === 429 ||
        response.status === 402 ||
        json.triggerUpgrade ||
        json.error === 'OUT_OF_CREDITS' ||
        json.error === 'FINGERPRINT_LIMIT_REACHED' ||
        json.error === 'IP_LIMIT_REACHED'
      ) {
        setSearchError(
          json.message ||
            'You have exhausted your 3 free intelligence search credits. Upgrade to Pro for unlimited searches.'
        );
        setIsUpgradeModalOpen(true);
        if (json.profile) {
          setProfile(json.profile);
          localStorage.setItem('verifyn_user_profile', JSON.stringify(json.profile));
        }
        return;
      }

      if (json.data) {
        setData(json.data);
      }
      if (json.profile) {
        setProfile(json.profile);
        localStorage.setItem('verifyn_user_profile', JSON.stringify(json.profile));
      }
      // Switch to dashboard smoothly
      if (activePage === 'search') {
        setActivePage('dashboard');
        window.history.pushState({}, '', `/dashboard/${json.data?.symbol || newQuery}`);
      }
    } catch (err: any) {
      console.error('Search failure:', err);
      setSearchError('Search failed. Checking offline intelligence database.');
      const clean = newQuery.trim().toUpperCase();
      if (FEATURED_COMPANIES[clean]) {
        setData(FEATURED_COMPANIES[clean]);
      }
      if (activePage === 'search') {
        setActivePage('dashboard');
        window.history.pushState({}, '', `/dashboard/${clean}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sandbox QA: Toggle Pro membership on the server & database
  const handleTogglePro = async () => {
    try {
      const nextPro = !profile.is_pro;
      const res = await fetch('/api/profile/toggle-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          makePro: nextPro,
        }),
      });
      const resData = await res.json();
      if (resData.profile) {
        setProfile(resData.profile);
        localStorage.setItem('verifyn_user_profile', JSON.stringify(resData.profile));
      }
    } catch (e) {
      setProfile((prev) => ({ ...prev, is_pro: !prev.is_pro }));
    }
  };

  // Sandbox QA: Reset or set credits for testing
  const handleResetCredits = async (amount: number = 3) => {
    try {
      const res = await fetch('/api/profile/toggle-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          resetCredits: amount,
        }),
      });
      const resData = await res.json();
      if (resData.profile) {
        setProfile(resData.profile);
        localStorage.setItem('verifyn_user_profile', JSON.stringify(resData.profile));
      }
    } catch (e) {
      setProfile((prev) => ({ ...prev, credits: amount }));
    }
  };

  // Handle PDF Export click
  const handleExportPdfClick = () => {
    if (!profile.is_pro) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsPdfModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Sticky Frosted Glass Navbar */}
      <Header
        currentQuery={query}
        onSearch={handleSearch}
        isLoading={isLoading}
        profile={profile}
        user={user}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenAuthModal={(mode) => triggerAuthWall(mode || 'signup')}
        onSignOut={handleSignOut}
        onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
        onTogglePro={handleTogglePro}
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      {/* Main Routed Content Area with Route Transitions */}
      <AnimatePresence mode="wait">
        {activePage === 'pricing' && (
          <motion.main
            key="pricing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <PricingPage
              profile={profile}
              onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
              onStartSearch={(ticker) => {
                handleSearch(ticker);
                handleNavigate('dashboard');
              }}
              onHandoverClick={() => setIsHandoverModalOpen(true)}
            />
          </motion.main>
        )}

        {activePage === 'about' && (
          <motion.main
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <AboutPage
              onStartSearch={(ticker) => {
                handleSearch(ticker);
                handleNavigate('dashboard');
              }}
              onContactClick={() => handleNavigate('contact')}
              onHandoverClick={() => setIsHandoverModalOpen(true)}
            />
          </motion.main>
        )}

        {activePage === 'contact' && (
          <motion.main
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <ContactPage
              onBackToSearch={() => handleNavigate('search')}
              onHandoverClick={() => setIsHandoverModalOpen(true)}
            />
          </motion.main>
        )}

        {activePage === 'privacy' && (
          <motion.main
            key="privacy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <PrivacyPage onBack={() => handleNavigate('search')} />
          </motion.main>
        )}

        {activePage === 'terms' && (
          <motion.main
            key="terms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <TermsPage onBack={() => handleNavigate('search')} />
          </motion.main>
        )}

        {activePage === 'auth-callback' && (
          <motion.main
            key="auth-callback"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 w-full flex items-center justify-center"
          >
            <AuthCallback
              onAuthSuccess={handleAuthSuccess}
              onNavigate={handleNavigate}
            />
          </motion.main>
        )}

        {activePage === 'search' && (
          <motion.main
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12"
          >
            {/* Hero Search Hub with Autocomplete & Floating Gradient Meshes */}
            <HeroSearch
              currentQuery={query}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Error / Exhaustion Alert */}
            {searchError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">{searchError}</span>
                </div>
                <button
                  id="exhaustion-upgrade-btn"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  Unlock Unlimited ($9.99/mo)
                </button>
              </div>
            )}

            {/* Live Intelligence Spotlight Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <GlassCard className="p-6 border border-emerald-500/40 bg-white/85 shadow-lg">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-base font-extrabold text-emerald-400 shrink-0 shadow-sm">
                      ${data.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          ACTIVE AUDIT SPOTLIGHT
                        </span>
                        <span className="text-xs font-mono text-slate-500">{data.exchange} • CIK {data.cik}</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                        {data.companyName}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {data.sector} • Valuation: {data.marketCapFormatted} • CEO: {data.ceo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleNavigate('dashboard')}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-mono transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>Open Diligence Dashboard →</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Feature Highlights Grid with Scroll Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-4"
            >
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-500">
                  Autonomous Multi-Source Diligence Engine
                </h3>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Everything analysts need for $9.99/mo instead of $24,000/yr.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <GlassCard className="p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                      <Database className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Zero-Key SEC EDGAR & PatentsView</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Statutory 10-K disclosures, CIK indexes, and USPTO patent grants are ingested directly via federal public APIs with 0% ongoing data API overhead.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>99%+ Gross Margin for Buyers</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Gemini 3.8 Flash AI Forensics</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Synthesizes hundreds of pages of statutory Item 1A Risk Factors into a clean 0-100 corporate vulnerability grade with specific red flags.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-purple-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Server-Side Secure Proxy</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">13F Cap Table & Institutional Float</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Visualize insider stakes versus institutional block holdings with concentration bars and quarterly rebalancing data.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono text-sky-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unredacted in Pro Tier</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>

            {/* Testimonials / Industry Trust with Scroll Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pt-6 space-y-4"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Institutional Analyst Accreditations
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Trusted by independent researchers & boutique PE firms
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 border border-slate-200/80 bg-white/80">
                  <Quote className="w-6 h-6 text-emerald-500/50 mb-3" />
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &quot;Verifyn replaced two clunky paid database seats for our initial screening pipeline. The combination of instant 10-K financial CAGR and PatentsView IP tracking in one screen is remarkably fast.&quot;
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-900">Marcus Vance, CFA</span>
                    <span className="text-slate-500">Managing Director, Horizon Alpha Partners</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 border border-slate-200/80 bg-white/80">
                  <Quote className="w-6 h-6 text-emerald-500/50 mb-3" />
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &quot;The AI forensic risk scoring catches subtle legal disclaimer changes between annual 10-Ks that would otherwise take our junior analysts hours of manual cross-referencing.&quot;
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-900">Elena Rostova</span>
                    <span className="text-slate-500">Principal, Stonebridge Special Situations</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>

          </motion.main>
        )}

        {activePage === 'dashboard' && (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
          >
            {!user ? (
              /* Mandatory Authentication Wall Gate */
              <div className="py-12 px-2">
                <GlassCard className="max-w-2xl mx-auto p-8 sm:p-10 border border-emerald-500/30 bg-white/95 shadow-2xl text-center relative overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 absolute top-0 left-0 right-0" />

                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Lock className="w-7 h-7" />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Mandatory Authentication Gate
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-2">
                    Institutional Intelligence Wall
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
                    Live SEC EDGAR filings, 13F insider ownership tables, USPTO patents, and AI forensic risk ratings require an authenticated account.
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto mb-8 text-left text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 font-sans font-medium">3 Free Instant Audits</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 font-sans font-medium">SEC EDGAR 10-K Data</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 font-sans font-medium">USPTO Patent Records</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-700 font-sans font-medium">AI Forensic Risk Scoring</span>
                    </div>
                  </div>

                  {/* Auth Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      id="dashboard-wall-signup-btn"
                      onClick={() => triggerAuthWall('signup', `Create a free account to audit ${data.symbol} with 3 complimentary search credits.`)}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl text-xs font-bold font-mono transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>Sign Up Free (3 Free Credits)</span>
                    </button>
                    <button
                      id="dashboard-wall-login-btn"
                      onClick={() => triggerAuthWall('login')}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-slate-600" />
                      <span>Log In</span>
                    </button>
                  </div>
                </GlassCard>
              </div>
            ) : (
              <>
                {/* Credit Exhaustion / Error Banner */}
                {searchError && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between gap-4 shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium">{searchError}</span>
                    </div>
                    <button
                      id="exhaustion-upgrade-btn"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      Unlock Unlimited ($9.99/mo)
                    </button>
                  </div>
                )}

                {/* Company Header (Un-gated) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <CompanyHeader
                    data={data}
                    isPro={profile.is_pro}
                    onExportPdf={handleExportPdfClick}
                  />
                </motion.div>

                {/* Un-gated Views: 3-Year & 10-Year Recharts Financials & Leadership Roster */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  <div className="lg:col-span-7">
                    <RevenueChart data={data.revenueHistory} symbol={data.symbol} />
                  </div>
                  <div className="lg:col-span-5">
                    <FoundersLeadership
                      leadership={data.leadership}
                      employeeCount={data.employeeCount}
                      headcountGrowthYoY={data.headcountGrowthYoY}
                    />
                  </div>
                </motion.div>

                {/* Gated Section Title */}
                <div className="pt-6 flex items-center justify-between border-t border-slate-200/80">
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs animate-pulse"></span>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Deep Diligence & Forensic Registry Modules
                    </h2>
                  </div>
                  {!profile.is_pro && (
                    <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-300 px-3 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Pro Gated Access (Frosted Glass Protected)</span>
                    </span>
                  )}
                </div>

                {/* Gated Views: Cap Table & Gemini AI Risk Forensics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  <div className="lg:col-span-6">
                    <GatedModule
                      isLoading={isLoading}
                      isPro={profile.is_pro}
                      title="Cap Table & 13F Ownership"
                      subtitle="Access unredacted institutional holdings, insider equity percentages, and float concentration."
                      badge="PRO INTEL"
                      onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                      skeleton={<CapTableSkeleton symbol={data.symbol} />}
                    >
                      <CapTable data={data.capTable} symbol={data.symbol} isLoading={isLoading} />
                    </GatedModule>
                  </div>

                  <div className="lg:col-span-6">
                    <GatedModule
                      isLoading={isLoading}
                      isPro={profile.is_pro}
                      title="Gemini AI Risk & Red Flag Forensics"
                      subtitle="Full forensic audit of SEC 10-K disclosures, 0-100 risk scoring, and automated red flag detection."
                      badge="GEMINI FLASH"
                      onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                      skeleton={<RiskAssessmentCardSkeleton companyName={data.companyName} />}
                    >
                      <RiskAssessmentCard
                        data={data.riskAssessment}
                        companyName={data.companyName}
                        isLoading={isLoading}
                      />
                    </GatedModule>
                  </div>
                </motion.div>

                {/* Gated Views: US Patent Registry & Competitor Matrix */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <GatedModule
                    isLoading={isLoading}
                    isPro={profile.is_pro}
                    title="PatentsView Intellectual Property Registry"
                    subtitle="Explore direct USPTO grant abstracts, assignee records, and IPC technology classifications."
                    badge="USPTO DATA"
                    onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                  >
                    <PatentRegistry patents={data.patents} companyName={data.companyName} />
                  </GatedModule>

                  <GatedModule
                    isLoading={isLoading}
                    isPro={profile.is_pro}
                    title="Competitor Benchmark Matrix"
                    subtitle="Institutional peer comparison across EV/Revenue multiples, gross margins, and AI risk grades."
                    badge="PEER BENCHMARK"
                    onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                  >
                    <CompetitorMatrix
                      competitors={data.competitors}
                      currentSymbol={data.symbol}
                    />
                  </GatedModule>
                </motion.div>
              </>
            )}

          </motion.main>
        )}
      </AnimatePresence>

      {/* Complete SaaS Footer with All Required Pages */}
      <footer className="border-t border-slate-200/80 py-10 mt-12 bg-white/70 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-900 font-bold">VERIFYN SAAS</span>
              <span>• Corporate Intelligence & Due Diligence Platform</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleNavigate('search')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Search Hub
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Diligence View
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('pricing')}
                className="hover:text-slate-900 transition-colors cursor-pointer text-emerald-700 font-semibold"
              >
                Pricing ($9.99/mo)
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('about')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                About Us
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('contact')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Contact Us
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('privacy')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => handleNavigate('terms')}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>© 2026 Verifyn Technologies Inc. All rights reserved.</span>
            <span className="text-emerald-700 font-semibold">Real-Time Regulatory Intelligence • SEC EDGAR & USPTO Direct</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        subtitleMessage={authModalSubtitle}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        profile={profile}
        onSubscriptionSuccess={(updatedProfile) => {
          if (updatedProfile) {
            setProfile(updatedProfile);
            try {
              localStorage.setItem('verifyn_user_profile', JSON.stringify(updatedProfile));
            } catch (e) {}
          } else {
            setProfile((prev) => {
              const updated = { ...prev, is_pro: true };
              try {
                localStorage.setItem('verifyn_user_profile', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
          setSearchError(null);
        }}
      />

      <HandoverModal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
      />

      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        data={data}
      />

    </div>
  );
}
