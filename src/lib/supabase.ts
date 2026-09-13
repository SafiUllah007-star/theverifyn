import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { UserProfile, AuthUser } from '../types';

export const DEFAULT_USER_ID = 'usr_8f912a7d-b541-4e99-9231-c89b02a8e411';

// Vite client-side environment variables safely retrieved
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export let clientSupabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Dynamically initialize client if credentials fetched from /api/auth/config
export function configureClientSupabase(url: string, anonKey: string): SupabaseClient | null {
  if (url && anonKey && !clientSupabase) {
    clientSupabase = createClient(url, anonKey);
  }
  return clientSupabase;
}

const AUTH_STORAGE_KEY = 'verifyn_auth_session';

/**
 * Fetch authenticated session or cached user session.
 */
export async function getActiveAuthSession(): Promise<{ user: AuthUser; profile: UserProfile } | null> {
  // Check Supabase native auth session first if client is available
  if (clientSupabase) {
    try {
      const { data } = await clientSupabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata || {};
        const email = u.email || meta.email || '';
        const name = meta.full_name || meta.name || meta.given_name || (email ? email.split('@')[0] : 'User');
        const avatarUrl = meta.avatar_url || meta.picture;
        const provider = u.app_metadata?.provider || 'google';

        const authUser: AuthUser = {
          id: u.id,
          email,
          name,
          avatar_url: avatarUrl,
          provider,
        };

        let profile = await fetchUserProfile(u.id);
        if (!profile) {
          profile = await syncUserProfileWithServer(authUser);
        }

        const safeProfile: UserProfile = profile || {
          id: u.id,
          email,
          credits: 3,
          is_pro: false,
        };
        return { user: authUser, profile: safeProfile };
      }
    } catch (e) {
      console.warn('[Supabase Auth] Session lookup error:', e);
    }
  }

  // Check persistent local storage session
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.id) {
        // Fetch freshest profile from database to ensure credit balances persist accurately across page refreshes
        const freshProfile = await fetchUserProfile(parsed.user.id);
        const activeProfile = freshProfile || parsed.profile;
        return {
          user: parsed.user,
          profile: activeProfile,
        };
      }
    }
  } catch (e) {
    console.warn('[Supabase Auth] Local session parsing error:', e);
  }

  return null;
}

/**
 * Synchronize user profile with backend database/Supabase to ensure
 * public.profiles row exists with initial credits = 3 and user's email.
 */
export async function syncUserProfileWithServer(user: AuthUser): Promise<UserProfile> {
  try {
    const res = await fetch('/api/auth/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        provider: user.provider || 'email',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        return data.profile;
      }
    }
  } catch (err) {
    console.warn('[Supabase Auth] Error syncing user profile with server:', err);
  }

  return {
    id: user.id,
    email: user.email,
    credits: 3,
    is_pro: false,
  };
}

/**
 * Resolves the dynamic authentication callback redirect URL.
 * Automatically respects the active host, protocol, and port (e.g. http://localhost:3000/auth/callback)
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    return `${origin}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
}

/**
 * Sign up with Work/Corporate Email and Password using Supabase Auth.
 * Automatically triggers Supabase email confirmation when enabled.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<{ user: AuthUser; profile: UserProfile; confirmationRequired?: boolean }> {
  // Step 1: Pre-validate disposable email via anti-abuse layer
  const valRes = await fetch('/api/auth/validate-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const valData = await valRes.json();
  if (!valRes.ok || !valData.allowed) {
    throw new Error(valData.message || 'Disposable email addresses are not permitted. Please use a corporate email.');
  }

  // Pre-fetch auth configuration if clientSupabase not yet configured
  if (!clientSupabase) {
    try {
      const cfgRes = await fetch('/api/auth/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          configureClientSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey);
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth] Pre-auth configuration fetch error:', e);
    }
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    localStorage.setItem('verifyn_pending_email', cleanEmail);
  } catch (e) {
    // ignore
  }

  // Step 2: Supabase client signup if credentials configured
  if (clientSupabase) {
    try {
      const redirectUrl = getAuthRedirectUrl();
      const { data, error } = await clientSupabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName?.trim(),
            name: fullName?.trim(),
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already taken') || msg.includes('user already exists')) {
          throw new Error('An account with this email already exists. Please switch to Sign In.');
        } else if (msg.includes('least 6') || msg.includes('weak') || msg.includes('short')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (msg.includes('valid email')) {
          throw new Error('Please enter a valid corporate or work email address.');
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        // Supabase returns an empty identities array if user already registered to prevent user enumeration
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error('An account with this email already exists. Please switch to Sign In.');
        }

        const u = data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: cleanEmail,
          name: fullName?.trim() || cleanEmail.split('@')[0],
          provider: 'email',
        };

        // When Supabase email confirmation is enabled, session is null until user clicks link
        const confirmationRequired = !data.session;

        // Ensure database profile exists with 3 free credits via server sync / trigger
        let profile = await fetchUserProfile(u.id);
        if (!profile) {
          profile = await syncUserProfileWithServer(authUser);
        }

        const userProfile: UserProfile = profile || {
          id: u.id,
          email: cleanEmail,
          credits: 3,
          is_pro: false,
        };

        if (!confirmationRequired) {
          const sessionPayload = { user: authUser, profile: userProfile };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));
          localStorage.setItem('verifyn_user_profile', JSON.stringify(userProfile));
        }

        return { user: authUser, profile: userProfile, confirmationRequired };
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('[Supabase Auth] Client signup encountered error, using server endpoint:', err.message);
    }
  }

  // Step 3: Register through persistent backend endpoint (fallback)
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password, fullName: fullName?.trim() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Registration failed. Please check your credentials.');
  }

  const result = await res.json();
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem('verifyn_user_profile', JSON.stringify(result.profile));
  } catch (e) {
    // ignore
  }

  return { ...result, confirmationRequired: false };
}

/**
 * Resend email verification link via Supabase Auth and backend relay.
 */
export async function resendConfirmationEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const redirectUrl = getAuthRedirectUrl();

  if (!clientSupabase) {
    try {
      const cfgRes = await fetch('/api/auth/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          configureClientSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey);
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth] Pre-auth configuration fetch error:', e);
    }
  }

  let clientSuccess = false;
  if (clientSupabase) {
    try {
      const { error } = await clientSupabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.warn('[Supabase Auth] client resend notice:', error.message);
        const msg = error.message.toLowerCase();
        if (msg.includes('rate limit')) {
          throw new Error('Too many verification requests. Please wait a minute before requesting another link.');
        }
      } else {
        clientSuccess = true;
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Too many')) {
        throw err;
      }
      console.warn('[Supabase Auth] client resend error, checking server endpoint:', err.message);
    }
  }

  // Backup with server endpoint
  const res = await fetch('/api/auth/resend-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, redirectUrl }),
  });

  if (!res.ok && !clientSuccess) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || 'Failed to dispatch verification email. Please try again.');
  }

  return {
    success: true,
    message: `A fresh verification link was dispatched to ${cleanEmail}. Please check your inbox (and spam folder).`,
  };
}

/**
 * Sign in with existing email and password using Supabase Auth
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AuthUser; profile: UserProfile }> {
  const cleanEmail = email.trim().toLowerCase();

  // Pre-fetch auth configuration if clientSupabase not yet configured
  if (!clientSupabase) {
    try {
      const cfgRes = await fetch('/api/auth/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
          configureClientSupabase(cfg.supabaseUrl, cfg.supabaseAnonKey);
        }
      }
    } catch (e) {
      console.warn('[Supabase Auth] Pre-auth configuration fetch error:', e);
    }
  }

  // Step 1: Client Supabase sign in with Password
  if (clientSupabase) {
    try {
      const { data, error } = await clientSupabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          const customErr: any = new Error(
            'Invalid email or password. If you recently signed up, your confirmation link may have expired or your email is unverified.'
          );
          customErr.isUnconfirmedCandidate = true;
          customErr.email = cleanEmail;
          throw customErr;
        } else if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          const customErr: any = new Error(
            'Your email address has not been confirmed yet. Please verify your email or click "Resend Verification Link".'
          );
          customErr.isUnconfirmedCandidate = true;
          customErr.email = cleanEmail;
          throw customErr;
        } else if (msg.includes('rate limit')) {
          throw new Error('Too many sign in attempts. Please wait a minute and try again.');
        }
        throw new Error(error.message);
      }

      if (data?.user) {
        const u = data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: cleanEmail,
          name: u.user_metadata?.full_name || u.user_metadata?.name || cleanEmail.split('@')[0],
          provider: 'email',
        };

        // Query database for current profile to preserve user credits
        let profile = await fetchUserProfile(u.id);
        if (!profile) {
          profile = await syncUserProfileWithServer(authUser);
        }

        const userProfile: UserProfile = profile || {
          id: u.id,
          email: cleanEmail,
          credits: 3,
          is_pro: false,
        };

        const sessionPayload = { user: authUser, profile: userProfile };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionPayload));
        localStorage.setItem('verifyn_user_profile', JSON.stringify(userProfile));
        return sessionPayload;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('[Supabase Auth] Client signInWithPassword error, checking backend:', err.message);
    }
  }

  // Step 2: Fallback through backend auth endpoint
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const customErr: any = new Error(
      err.message || err.error || 'Invalid email or password. If you recently signed up, your confirmation link may have expired.'
    );
    customErr.isUnconfirmedCandidate = true;
    customErr.email = cleanEmail;
    throw customErr;
  }

  const result = await res.json();
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    localStorage.setItem('verifyn_user_profile', JSON.stringify(result.profile));
  } catch (e) {
    // ignore
  }

  return result;
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  if (clientSupabase) {
    try {
      await clientSupabase.auth.signOut();
    } catch (e) {
      console.warn('[Supabase Auth] Sign out error:', e);
    }
  }
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('verifyn_user_profile');
  } catch (e) {
    // ignore
  }
}

/**
 * Fetch profile directly from Supabase if configured, or through backend /api/profile endpoint.
 * Ensures the source of truth is always respected and persisted across refreshes.
 */
export async function fetchUserProfile(userId: string = DEFAULT_USER_ID): Promise<UserProfile | null> {
  // If client Supabase keys are defined, query public.profiles directly
  if (clientSupabase) {
    try {
      const { data, error } = await clientSupabase
        .from('profiles')
        .select('id, email, credits, is_pro, lemon_squeezy_customer_id, created_at')
        .eq('id', userId)
        .single();

      if (data && !error) {
        return {
          id: data.id,
          email: data.email || 'researcher@hedgefund-capital.com',
          credits: typeof data.credits === 'number' ? data.credits : 3,
          is_pro: Boolean(data.is_pro),
          lemon_squeezy_customer_id: data.lemon_squeezy_customer_id,
          created_at: data.created_at,
        };
      }
    } catch (err) {
      console.warn('[Client DB] Client Supabase query failed, using /api/profile:', err);
    }
  }

  // Fallback / standard route: fetch from server database endpoint
  try {
    const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.credits === 'number') {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Client DB] Backend /api/profile request error:', err);
  }

  return null;
}

