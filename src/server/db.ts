import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export const DEFAULT_USER_ID = 'usr_8f912a7d-b541-4e99-9231-c89b02a8e411';
export const DEFAULT_USER_EMAIL = 'researcher@hedgefund-capital.com';

// Local storage path for persistent fallback (ensures credits never reset on page refresh or server restarts)
const DATA_DIR = path.join(process.cwd(), '.data');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[DB] Error creating data directory:', err);
  }
}

function loadLocalProfiles(): Record<string, UserProfile> {
  ensureDataDir();
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[DB] Error reading local profiles store:', err);
  }
  return {};
}

function saveLocalProfile(profile: UserProfile): void {
  ensureDataDir();
  try {
    const profiles = loadLocalProfiles();
    profiles[profile.id] = {
      ...profiles[profile.id],
      ...profile,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Error writing local profiles store:', err);
  }
}

// Initialize Supabase client if environment credentials exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

if (supabase) {
  console.log('[DB] Supabase database client initialized with endpoint:', supabaseUrl);
} else {
  console.log('[DB] Supabase credentials not found in env; using persistent disk store at:', PROFILES_FILE);
}

/**
 * Fetch user profile from Supabase (or persistent store).
 * If profile does not exist yet, seeds it with 3 initial credits.
 */
export async function getUserProfile(userId: string = DEFAULT_USER_ID): Promise<UserProfile> {
  const localProfiles = loadLocalProfiles();
  const local = localProfiles[userId];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, credits, is_pro, lemon_squeezy_customer_id, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const fetched: UserProfile = {
          id: data.id,
          email: data.email || DEFAULT_USER_EMAIL,
          credits: typeof data.credits === 'number' ? data.credits : 3,
          is_pro: Boolean(data.is_pro),
          lemon_squeezy_customer_id: data.lemon_squeezy_customer_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        saveLocalProfile(fetched);
        return fetched;
      }

      // If record not found in Supabase (PGRST116), insert it with 3 default credits
      if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
        const newRecord: UserProfile = local || {
          id: userId,
          email: DEFAULT_USER_EMAIL,
          credits: 3,
          is_pro: false,
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert([newRecord])
          .select()
          .single();

        if (inserted && !insertError) {
          saveLocalProfile(inserted as UserProfile);
          return inserted as UserProfile;
        }
      }
    } catch (err) {
      console.warn('[DB] Supabase fetch failed, falling back to local persistent store:', err);
    }
  }

  // Fallback to persistent local disk
  if (local) {
    return local;
  }

  // Initial seed if first time ever running
  const initialProfile: UserProfile = {
    id: userId,
    email: DEFAULT_USER_EMAIL,
    credits: 3,
    is_pro: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveLocalProfile(initialProfile);
  return initialProfile;
}

/**
 * Deduct a credit strictly according to the required sequence:
 * 1. Check current profile & credits
 * 2. If is_pro === true -> proceed without deduction
 * 3. If credits <= 0 -> reject (out of credits)
 * 4. If is_pro === false AND credits > 0:
 *    Execute: UPDATE public.profiles SET credits = credits - 1 WHERE id = userId AND is_pro = FALSE AND credits > 0;
 *    Persist in database before proceeding with external search.
 */
export async function deductCredit(
  userId: string = DEFAULT_USER_ID
): Promise<{ success: boolean; profile: UserProfile; reason?: string }> {
  const current = await getUserProfile(userId);

  // Pro users have unlimited access
  if (current.is_pro) {
    return { success: true, profile: current };
  }

  // Enforce zero-credit barrier
  if (current.credits <= 0) {
    return {
      success: false,
      reason: 'OUT_OF_CREDITS',
      profile: current,
    };
  }

  const nextCredits = Math.max(0, current.credits - 1);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          credits: nextCredits,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        const updated: UserProfile = {
          id: data.id,
          email: data.email || current.email,
          credits: data.credits,
          is_pro: Boolean(data.is_pro),
          lemon_squeezy_customer_id: data.lemon_squeezy_customer_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        saveLocalProfile(updated);
        return { success: true, profile: updated };
      }
    } catch (err) {
      console.warn('[DB] Supabase credit deduction error, using local persistent fallback:', err);
    }
  }

  // Persistent disk update
  current.credits = nextCredits;
  current.updated_at = new Date().toISOString();
  saveLocalProfile(current);
  return { success: true, profile: current };
}

/**
 * Update user profile (e.g. grant Pro status, reset credits for sandbox QA).
 * Updates both Supabase and the local disk store.
 */
export async function updateUserProfile(
  userId: string = DEFAULT_USER_ID,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const current = await getUserProfile(userId);
  const nextProfile: UserProfile = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...(typeof updates.credits === 'number' ? { credits: updates.credits } : {}),
          ...(typeof updates.is_pro === 'boolean' ? { is_pro: updates.is_pro } : {}),
          ...(updates.lemon_squeezy_customer_id ? { lemon_squeezy_customer_id: updates.lemon_squeezy_customer_id } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (!error && data) {
        const updated: UserProfile = {
          id: data.id,
          email: data.email || nextProfile.email,
          credits: data.credits,
          is_pro: Boolean(data.is_pro),
          lemon_squeezy_customer_id: data.lemon_squeezy_customer_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        saveLocalProfile(updated);
        return updated;
      }
    } catch (err) {
      console.warn('[DB] Supabase update failed, using local persistent store:', err);
    }
  }

  saveLocalProfile(nextProfile);
  return nextProfile;
}
