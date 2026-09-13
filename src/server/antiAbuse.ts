import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { supabase } from './db';

const DATA_DIR = path.join(process.cwd(), '.data');
const ABUSE_STORE_FILE = path.join(DATA_DIR, 'abuse_store.json');

// Ensure storage directory exists
function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('[AntiAbuse] Directory creation warning:', e);
  }
}

interface AbuseStoreData {
  ipSearches: Record<string, { count: number; firstSeen: string; lastSeen: string }>;
  fingerprintSearches: Record<string, { count: number; firstSeen: string; lastSeen: string; associatedIps: string[] }>;
  blockedEmails: string[];
}

function loadAbuseStore(): AbuseStoreData {
  ensureDir();
  try {
    if (fs.existsSync(ABUSE_STORE_FILE)) {
      const raw = fs.readFileSync(ABUSE_STORE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[AntiAbuse] Read error:', err);
  }
  return {
    ipSearches: {},
    fingerprintSearches: {},
    blockedEmails: [],
  };
}

function saveAbuseStore(data: AbuseStoreData): void {
  ensureDir();
  try {
    fs.writeFileSync(ABUSE_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AntiAbuse] Write error:', err);
  }
}

// -----------------------------------------------------------------------------
// 1. IP-Based Rate Limiter (Upstash Redis + Permissive Development Fallback)
// -----------------------------------------------------------------------------
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Detect dummy, sandbox, or test credentials
export const isDummyUpstash = Boolean(
  !upstashUrl ||
  !upstashToken ||
  upstashUrl.includes('dummy') ||
  upstashToken.includes('dummy') ||
  upstashUrl.includes('example.com')
);

let upstashRatelimit: Ratelimit | null = null;

if (upstashUrl && upstashToken && !isDummyUpstash) {
  try {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '30 d'), // Max 3 requests per 30 days per IP
      analytics: true,
      prefix: 'verifyn_search_limit',
    });
    console.log('[AntiAbuse] Upstash Redis rate limiter initialized successfully.');
  } catch (err: any) {
    console.warn('[AntiAbuse] Upstash initialization failed, fallback active:', err?.message || err);
  }
} else if (isDummyUpstash && upstashUrl && upstashToken) {
  console.warn('[AntiAbuse] Upstash Redis configured with dummy credentials for local dev. Allowing all requests through without 500 errors.');
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

export async function checkAndIncrementIpLimit(
  ip: string,
  isPro: boolean = false
): Promise<{ allowed: boolean; count: number; remaining: number; resetTime?: number }> {
  if (isPro) {
    return { allowed: true, count: 0, remaining: 999 };
  }

  // Dev Fallback: If Upstash uses dummy keys, log a warning and allow the request through
  if (isDummyUpstash) {
    console.warn(`[AntiAbuse RateLimiter] Upstash dummy keys detected for IP ${ip}. Permitting request through without rate-limit block.`);
    return { allowed: true, count: 1, remaining: 2 };
  }

  // 1. Try Upstash Redis if configured with real keys
  if (upstashRatelimit) {
    try {
      const { success, remaining, reset } = await upstashRatelimit.limit(`search_ip_${ip}`);
      if (!success) {
        return { allowed: false, count: 3, remaining: 0, resetTime: reset };
      }
      return { allowed: true, count: 3 - remaining, remaining, resetTime: reset };
    } catch (err: any) {
      // If Upstash connection fails or times out, log warning and allow request through instead of throwing 500
      console.warn('[AntiAbuse RateLimiter] Upstash connection failed, allowing request through instead of throwing 500 error:', err?.message || err);
      return { allowed: true, count: 1, remaining: 2 };
    }
  }

  // 2. Persistent Storage (Supabase + Local Disk Store)
  try {
    const store = loadAbuseStore();
    const existing = store.ipSearches[ip] || { count: 0, firstSeen: new Date().toISOString(), lastSeen: new Date().toISOString() };

    if (existing.count >= 3) {
      return { allowed: false, count: existing.count, remaining: 0 };
    }

    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
    store.ipSearches[ip] = existing;
    saveAbuseStore(store);

    // Sync to Supabase ip_rate_limits table if active
    if (supabase) {
      supabase
        .from('ip_rate_limits')
        .upsert({ ip, search_count: existing.count, last_seen: existing.lastSeen })
        .then(
          () => {},
          (e) => console.warn('[AntiAbuse] Supabase IP rate limit sync warning:', e)
        );
    }

    return {
      allowed: true,
      count: existing.count,
      remaining: Math.max(0, 3 - existing.count),
    };
  } catch (storeErr: any) {
    console.warn('[AntiAbuse RateLimiter] Storage check warning, permitting request:', storeErr?.message || storeErr);
    return { allowed: true, count: 1, remaining: 2 };
  }
}

// -----------------------------------------------------------------------------
// 2. Browser Fingerprinting (Hardware & Canvas Signature Tracker)
// -----------------------------------------------------------------------------
export async function checkAndIncrementFingerprintLimit(
  visitorId: string,
  ip: string,
  isPro: boolean = false
): Promise<{ allowed: boolean; count: number; remaining: number }> {
  if (isPro) {
    return { allowed: true, count: 0, remaining: 999 };
  }

  if (!visitorId || visitorId.trim().length < 8) {
    // If no valid visitorId provided, rely on IP-level rate limiting
    return { allowed: true, count: 1, remaining: 2 };
  }

  const store = loadAbuseStore();
  const fpData = store.fingerprintSearches[visitorId] || {
    count: 0,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    associatedIps: [],
  };

  if (!fpData.associatedIps.includes(ip)) {
    fpData.associatedIps.push(ip);
  }

  // Hard limit: 3 lifetime free searches per hardware/browser fingerprint
  if (fpData.count >= 3) {
    return { allowed: false, count: fpData.count, remaining: 0 };
  }

  fpData.count += 1;
  fpData.lastSeen = new Date().toISOString();
  store.fingerprintSearches[visitorId] = fpData;
  saveAbuseStore(store);

  // Sync to Supabase device_fingerprints table if active
  if (supabase) {
    supabase
      .from('device_fingerprints')
      .upsert({
        visitor_id: visitorId,
        search_count: fpData.count,
        associated_ips: fpData.associatedIps,
        last_seen: fpData.lastSeen,
      })
      .then(
        () => {},
        (e) => console.warn('[AntiAbuse] Supabase fingerprint sync warning:', e)
      );
  }

  return {
    allowed: true,
    count: fpData.count,
    remaining: Math.max(0, 3 - fpData.count),
  };
}

// -----------------------------------------------------------------------------
// 3. Disposable & Temporary Email Blocker
// -----------------------------------------------------------------------------
// Known disposable, 10-minute, and burner email domain suffixes
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'mailinator.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getnada.com',
  'fakemailgenerator.com',
  'temp-mail.org',
  'mohmal.com',
  'crazymailing.com',
  'dropmail.me',
  'mytemp.email',
  'burnermail.io',
  'inboxkitten.com',
  'nada.ltd',
  'tempail.com',
  'throwawaymail.com',
  'emailondeck.com',
  'generator.email',
  'maildrop.cc',
  'harakirimail.com',
  'mailnesia.com',
  'spamgourmet.com',
  'guerrillamailblock.com',
]);

const DISPOSABLE_PATTERNS = [
  /temp.*mail/i,
  /10minute/i,
  /dispos/i,
  /fake.*mail/i,
  /throwaway/i,
  /guerrilla/i,
  /mailinator/i,
  /trashmail/i,
  /burner.*mail/i,
  /inboxkitten/i,
  /yopmail/i,
];

export function isDisposableEmail(email: string): { isDisposable: boolean; reason?: string } {
  if (!email || !email.includes('@')) {
    return { isDisposable: true, reason: 'Invalid email address format' };
  }

  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) {
    return { isDisposable: true, reason: 'Invalid email address structure' };
  }

  const domain = parts[1].trim();

  // 1. Direct domain lookup in disposable domain list
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isDisposable: true,
      reason: `The domain "${domain}" is a recognized disposable/temporary email service. Please use a verified business or standard personal email.`,
    };
  }

  // 2. Pattern matching against typical disposable domain conventions
  for (const pattern of DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return {
        isDisposable: true,
        reason: `Email domain "${domain}" matches temporary email characteristics. Registration requires a reputable email provider.`,
      };
    }
  }

  return { isDisposable: false };
}
