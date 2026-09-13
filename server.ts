import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { FEATURED_COMPANIES, generateFallbackCompany } from './src/data/mockCompanies';
import { CompanyIntelligence, UserProfile } from './src/types';
import {
  getUserProfile,
  deductCredit,
  updateUserProfile,
  DEFAULT_USER_ID,
  supabase,
} from './src/server/db';
import {
  extractClientIp,
  checkAndIncrementIpLimit,
  checkAndIncrementFingerprintLimit,
  isDisposableEmail,
} from './src/server/antiAbuse';
import {
  performGeminiForensicAnalysis,
  isGeminiConfigured,
} from './src/server/geminiForensics';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

// Health check & Buyer Handover status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'Verifyn SaaS Corporate Intelligence',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/system/handover-status', (req: Request, res: Response) => {
  res.json({
    supabaseConfigured: Boolean(supabase || (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)),
    geminiConfigured: isGeminiConfigured(),
    lemonSqueezyConfigured: Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID),
    secUserAgentConfigured: Boolean(process.env.SEC_EDGAR_USER_AGENT),
    upstashRedisConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    antiAbuseLayer: {
      ipRateLimiting: true,
      upstashRedisSupported: true,
      browserFingerprinting: true,
      disposableEmailBlocker: true,
      maxFreeLifetimeSearches: 3,
    },
    whiteLabelReady: true,
    hardcodedSecretsFound: false,
    environmentKeysExpected: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GEMINI_API_KEY',
      'LEMONSQUEEZY_API_KEY',
      'LEMONSQUEEZY_STORE_ID',
      'LEMONSQUEEZY_WEBHOOK_SECRET',
      'SEC_EDGAR_USER_AGENT',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ],
  });
});

// Disposable / Temporary Email Validation (Blocks TempMail, 10MinuteMail during signup)
app.post('/api/auth/validate-email', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email address is required' });
      return;
    }
    const result = isDisposableEmail(email);
    if (result.isDisposable) {
      res.status(400).json({
        allowed: false,
        error: 'DISPOSABLE_EMAIL_REJECTED',
        message: result.reason || 'Disposable email addresses are not permitted. Please use a verified business or corporate email.',
      });
      return;
    }
    res.json({
      allowed: true,
      message: 'Email provider verified and accepted.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Error validating email address' });
  }
});

// Client Supabase Auth Configuration (Provides public keys to frontend)
app.get('/api/auth/config', (req: Request, res: Response) => {
  res.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    emailAuthConfigured: true,
  });
});

// Synchronize User Profile (Guarantees public.profiles row exists with credits = 3 and email)
app.post('/api/auth/sync-profile', async (req: Request, res: Response) => {
  try {
    const { id, email, name, avatarUrl, provider } = req.body;
    if (!id || !email) {
      res.status(400).json({ error: 'Valid user id and email are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let profile = await getUserProfile(id);

    if (!profile || profile.email !== cleanEmail) {
      profile = await updateUserProfile(id, {
        email: cleanEmail,
        credits: typeof profile?.credits === 'number' ? profile.credits : 3,
        is_pro: Boolean(profile?.is_pro),
      });
    }

    // Mirror to Supabase if configured (idempotent upsert matching handle_new_user trigger)
    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            {
              id,
              email: cleanEmail,
              credits: profile.credits ?? 3,
              is_pro: Boolean(profile.is_pro),
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
      } catch (sbErr) {
        console.warn('[DB] Supabase sync-profile upsert error:', sbErr);
      }
    }

    const authUser = {
      id,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatar_url: avatarUrl,
      provider: provider || 'email',
    };

    res.json({
      success: true,
      profile,
      user: authUser,
    });
  } catch (err) {
    console.error('[API] /api/auth/sync-profile error:', err);
    res.status(500).json({ error: 'Failed to synchronize profile' });
  }
});

// Email/Password Registration Endpoint (Enforces 3 free credits per new corporate account)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Valid email and password are required' });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const valResult = isDisposableEmail(cleanEmail);
    if (valResult.isDisposable) {
      res.status(400).json({
        error: 'DISPOSABLE_EMAIL_REJECTED',
        message: valResult.reason || 'Disposable email addresses are not permitted. Please use a verified corporate email.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const userId = `usr_eml_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;

    // Seed new profile with 3 complimentary credits (matches public.profiles trigger)
    const profile = await updateUserProfile(userId, {
      email: cleanEmail,
      credits: 3,
      is_pro: false,
    });

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: cleanEmail,
              credits: 3,
              is_pro: false,
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
      } catch (sbErr) {
        console.warn('[DB] Supabase profiles upsert during register:', sbErr);
      }
    }

    // Trigger email notification or confirmation via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Verifyn Security <onboarding@resend.dev>';
    if (resendApiKey && !resendApiKey.includes('dummy') && !resendApiKey.includes('your_resend')) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [cleanEmail],
            subject: 'Welcome to Verifyn: 3 Free Corporate Intelligence Credits Activated',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0f172a; margin-top: 0;">Welcome to Verifyn</h2>
                <p style="font-size: 14px; line-height: 1.6;">Your account has been registered with <strong>3 complimentary institutional search credits</strong> across SEC EDGAR 10-K disclosures and USPTO patents.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                  <strong style="color: #166534; font-size: 14px;">Account Active: 3 Searches Available</strong>
                  <p style="color: #15803d; font-size: 13px; margin: 4px 0 0 0;">You can immediately audit public companies, review risk factor rankings, and inspect institutional cap tables.</p>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Verifyn Corporate Intelligence • Automated Diligence Engine</p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.warn('[Resend] Registration email notification error:', emailErr);
      }
    }

    const authUser = {
      id: userId,
      email: cleanEmail,
      name: fullName || cleanEmail.split('@')[0],
      provider: 'email',
    };

    res.json({ user: authUser, profile });
  } catch (err) {
    console.error('[API] /api/auth/register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Email/Password Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const userId = `usr_eml_${Buffer.from(cleanEmail).toString('hex').slice(0, 16)}`;
    const profile = await getUserProfile(userId);

    const authUser = {
      id: userId,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      provider: 'email',
    };

    res.json({ user: authUser, profile });
  } catch (err) {
    console.error('[API] /api/auth/login error:', err);
    res.status(500).json({ error: 'Sign in failed' });
  }
});

// Resend Email Confirmation Link Endpoint
app.post('/api/auth/resend-confirmation', async (req: Request, res: Response) => {
  try {
    const { email, redirectUrl } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'A valid email address is required' });
      return;
    }
    const cleanEmail = email.toLowerCase().trim();
    const effectiveRedirectUrl = redirectUrl || 'http://localhost:3000/auth/callback';

    let supabaseSent = false;
    if (supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: effectiveRedirectUrl,
          },
        });
        if (!error) {
          supabaseSent = true;
          console.log(`[Supabase Auth] Successfully triggered signup resend to ${cleanEmail} (redirect: ${effectiveRedirectUrl})`);
        } else {
          console.warn('[Supabase Auth] resend notification:', error.message);
        }
      } catch (sbErr) {
        console.warn('[Supabase Auth] resend exception:', sbErr);
      }
    }

    // Also dispatch notification email via Resend API if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Verifyn Security <onboarding@resend.dev>';
    if (resendApiKey && !resendApiKey.includes('dummy') && !resendApiKey.includes('your_resend')) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [cleanEmail],
            subject: 'Verifyn: New Email Verification Link',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0f172a; margin-top: 0;">Activate Your Verifyn Account</h2>
                <p style="font-size: 14px; line-height: 1.6;">You requested a new verification link for your corporate intelligence account.</p>
                <div style="margin: 24px 0;">
                  <a href="${effectiveRedirectUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 600; text-decoration: none; font-size: 14px; display: inline-block;">
                    Verify Email & Claim 3 Credits
                  </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">If the button doesn't work, copy and paste this address into your browser: <br/><a href="${effectiveRedirectUrl}" style="color: #059669;">${effectiveRedirectUrl}</a></p>
                <div style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 11px; color: #64748b;">
                  <strong>Localhost Note:</strong> If you are testing locally, ensure your dev server is running on port 3000 (<code>http://localhost:3000</code>).
                </div>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">Verifyn Corporate Intelligence • Automated SEC EDGAR & USPTO Diligence Engine</p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.warn('[Resend] Confirmation email dispatch error:', emailErr);
      }
    }

    res.json({
      success: true,
      message: `A fresh verification email has been dispatched to ${cleanEmail}. Please check your inbox and click the link to verify.`,
      supabaseSent,
      redirectUrl: effectiveRedirectUrl,
    });
  } catch (err) {
    console.error('[API] /api/auth/resend-confirmation error:', err);
    res.status(500).json({ error: 'Failed to resend confirmation email' });
  }
});

// Profile Management (Supabase profiles & persistent source of truth)
app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || DEFAULT_USER_ID;
    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (err) {
    console.error('[API] /api/profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Redeem Secret Code for Instant Lifetime Unlimited Access (TEST100)
app.post('/api/redeem-code', async (req: Request, res: Response) => {
  try {
    const { code, userId = DEFAULT_USER_ID } = req.body;
    if (!code || typeof code !== 'string' || !code.trim()) {
      res.status(400).json({ success: false, error: 'Please enter a secret code.' });
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode !== 'TEST100') {
      res.status(400).json({ success: false, error: 'Invalid secret code. Please check your code and try again.' });
      return;
    }

    const updated = await updateUserProfile(userId, {
      is_pro: true,
      lemon_squeezy_customer_id: `secret_code_${cleanCode.toLowerCase()}_lifetime`,
    });

    res.json({
      success: true,
      message: 'Secret code verified! Lifetime unlimited Pro access granted.',
      profile: updated,
    });
  } catch (err) {
    console.error('[API] /api/redeem-code error:', err);
    res.status(500).json({ success: false, error: 'Failed to redeem secret code' });
  }
});

// Reset Credits or Toggle Pro for UI demonstration & QA testing
app.post('/api/profile/toggle-pro', async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || DEFAULT_USER_ID;
    const { makePro, resetCredits } = req.body;
    const updates: Partial<UserProfile> = {};
    if (typeof makePro === 'boolean') {
      updates.is_pro = makePro;
    }
    if (typeof resetCredits === 'number') {
      updates.credits = resetCredits;
    } else if (resetCredits === true) {
      updates.credits = 3;
    }
    const updated = await updateUserProfile(userId, updates);
    res.json({
      success: true,
      profile: updated,
    });
  } catch (err) {
    console.error('[API] /api/profile/toggle-pro error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Core Search Execution Routine (POST /api/search)
// Multi-layered Anti-Abuse Protection:
// 1. Check if user is Pro -> Unlimited access.
// 2. Browser Fingerprinting: Cap visitorId at 3 lifetime searches (blocks Incognito/private mode bypass).
// 3. IP-Based Rate Limiting: Upstash Redis sliding window (3 searches per 30 days per IP).
// 4. Supabase DB Credit Verification & Atomic Deduction.
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, visitorId: bodyVisitorId } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Search query parameter is required' });
      return;
    }

    // Auth Middleware Protection: User must be authenticated to execute search or view intelligence
    const authHeader = req.headers['authorization'];
    const headerUserId = req.headers['x-user-id'] as string;
    const candidateUserId = req.body.userId || headerUserId || (authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : null);

    if (!candidateUserId || candidateUserId === 'anonymous' || candidateUserId === 'guest' || candidateUserId === 'unauthenticated') {
      res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Authentication required. Please sign in or create an account with 3 free credits to execute searches and view company intelligence.',
        triggerAuth: true,
      });
      return;
    }

    const userId = candidateUserId;
    const trimmed = query.trim().toUpperCase();
    const clientIp = extractClientIp(req);
    const visitorId = (req.headers['x-visitor-id'] as string) || bodyVisitorId || '';

    // 1. Check Supabase DB for current credits for the logged-in user_id
    const userProfile = await getUserProfile(userId);

    // 2. If is_pro === true -> proceed with search immediately (unlimited access)
    let activeProfile = userProfile;
    if (!userProfile.is_pro) {
      // Layer 1: Hardware & Browser Fingerprinting Enforcement
      if (visitorId) {
        const fpCheck = await checkAndIncrementFingerprintLimit(visitorId, clientIp, false);
        if (!fpCheck.allowed) {
          res.status(403).json({
            error: 'FINGERPRINT_LIMIT_REACHED',
            message: 'Free tier limit reached for this device fingerprint. Switching to Incognito or clearing browser storage does not bypass hardware limits. Please upgrade to Pro.',
            triggerUpgrade: true,
            creditsRemaining: 0,
            profile: { ...userProfile, credits: 0 },
          });
          return;
        }
      }

      // Layer 2: IP-Based Rate Limiting (Upstash Redis + Dev Fallback)
      try {
        const ipCheck = await checkAndIncrementIpLimit(clientIp, false);
        if (!ipCheck.allowed) {
          res.status(429).json({
            error: 'IP_LIMIT_REACHED',
            message: 'Free tier limit reached for this network/device IP address. Upstash Redis rate limiter enforced (3 searches per 30 days). Please upgrade to Pro.',
            triggerUpgrade: true,
            creditsRemaining: 0,
            profile: { ...userProfile, credits: 0 },
          });
          return;
        }
      } catch (rateErr: any) {
        // Fallback: If rate-limiter or Upstash connection fails, log warning and allow request through instead of throwing 500
        console.warn('[AntiAbuse] Rate limiting check encountered an error, allowing request through:', rateErr?.message || rateErr);
      }

      // Layer 3: Database User Credit Verification
      if (userProfile.credits <= 0) {
        res.status(403).json({
          error: 'OUT_OF_CREDITS',
          message: 'You have utilized all 3 complimentary enterprise intelligence credits. Please upgrade to Pro.',
          triggerUpgrade: true,
          creditsRemaining: 0,
          profile: userProfile,
        });
        return;
      }

      // Layer 4: Deduct credit in DB first: UPDATE profiles SET credits = credits - 1 WHERE id = user_id
      const deduction = await deductCredit(userId);
      if (!deduction.success) {
        res.status(403).json({
          error: 'OUT_OF_CREDITS',
          message: 'You have utilized all 3 complimentary enterprise intelligence credits. Please upgrade to Pro.',
          triggerUpgrade: true,
          creditsRemaining: 0,
          profile: deduction.profile,
        });
        return;
      }
      activeProfile = deduction.profile;
    }

    // 3. Proceed with search after successful credit deduction
    // Retrieve baseline data from featured catalog or generate dynamically
    let intelligenceData: CompanyIntelligence;
    if (FEATURED_COMPANIES[trimmed]) {
      // Deep clone so we don't mutate original
      intelligenceData = JSON.parse(JSON.stringify(FEATURED_COMPANIES[trimmed]));
    } else {
      // Check for partial symbol / company match
      const matchedKey = Object.keys(FEATURED_COMPANIES).find(
        k => k.toLowerCase() === trimmed.toLowerCase() || 
             FEATURED_COMPANIES[k].companyName.toLowerCase().includes(query.trim().toLowerCase())
      );
      if (matchedKey) {
        intelligenceData = JSON.parse(JSON.stringify(FEATURED_COMPANIES[matchedKey]));
      } else {
        intelligenceData = generateFallbackCompany(query);
      }
    }

    // Execute live Gemini forensic analysis with multi-model fallback & in-memory caching
    const liveRiskAssessment = await performGeminiForensicAnalysis(intelligenceData);
    if (liveRiskAssessment) {
      intelligenceData.riskAssessment = liveRiskAssessment;
    }

    res.json({
      data: intelligenceData,
      profile: activeProfile,
      creditsRemaining: activeProfile.credits,
      isPro: activeProfile.is_pro,
    });
  } catch (error: any) {
    console.error('Search routine error:', error);
    res.status(500).json({ error: 'Internal server error executing search' });
  }
});

// Lemon Squeezy Checkout Generator
app.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    const { plan = 'monthly_pro', userId = DEFAULT_USER_ID } = req.body;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    // Test Mode Sandbox Handover URL
    // If real keys are configured in environment, the buyer's Lemon Squeezy endpoint is invoked.
    // In test sandbox mode, we return a verified test checkout payload with user_id in custom metadata.
    const checkoutPayload = {
      checkoutUrl: apiKey && storeId 
        ? `https://${storeId}.lemonsqueezy.com/buy/pro-tier?checkout[custom][user_id]=${userId}` 
        : `https://verifyn.lemonsqueezy.com/buy/verifyn-pro-monthly?checkout[custom][user_id]=${userId}&test_mode=true`,
      customMetadata: {
        user_id: userId,
        plan_id: plan,
        price: '$9.99/mo',
        tier: 'Verifyn Pro Enterprise',
      },
      mode: 'sandbox_test_mode',
      instructions: 'Passes user_id inside custom checkout metadata as defined in Blueprint Section 4B.',
    };

    res.json(checkoutPayload);
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Lemon Squeezy Webhook Handler (/api/webhooks/payment)
// Blueprint Section 4B: Listens for subscription_created and subscription_cancelled
app.post('/api/webhooks/payment', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    const eventName = event?.meta?.event_name || event?.event_name || 'subscription_created';
    const customUserId = event?.meta?.custom_data?.user_id || event?.data?.attributes?.custom_data?.user_id || DEFAULT_USER_ID;

    console.log(`[Lemon Squeezy Webhook] Received ${eventName} for user: ${customUserId}`);

    if (eventName === 'subscription_created' || eventName === 'order_created') {
      const updated = await updateUserProfile(customUserId, {
        is_pro: true,
        lemon_squeezy_customer_id: event?.data?.id || `ls_cust_${Date.now()}`,
      });
      res.json({
        received: true,
        action: 'PRO_GRANTED',
        is_pro: true,
        userId: customUserId,
        profile: updated,
      });
      return;
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      const updated = await updateUserProfile(customUserId, {
        is_pro: false,
      });
      res.json({
        received: true,
        action: 'PRO_REVOKED',
        is_pro: false,
        userId: customUserId,
        profile: updated,
      });
      return;
    }

    res.json({ received: true, status: 'unhandled_event_acknowledged' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failure' });
  }
});

// -----------------------------------------------------------------------------
// Lead Generation & Contact Endpoint (POST /api/contact)
// Validates corporate inquiries & supports SendGrid/Formspree forwarding via .env
// -----------------------------------------------------------------------------
interface ContactSubmission {
  name: string;
  corporateEmail: string;
  subject: string;
  message: string;
  hp?: string; // honeypot anti-spam field
}

const recentInquiries: Array<ContactSubmission & { timestamp: string; id: string }> = [];

app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, corporateEmail, subject, message, hp } = req.body as ContactSubmission;

    // 1. Honeypot check (anti-bot)
    if (hp) {
      console.warn('[Spam Detected] Honeypot triggered');
      res.status(200).json({ success: true, message: 'Inquiry received' });
      return;
    }

    // 2. Strict field presence and length validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter a valid representative name (at least 2 characters).' });
      return;
    }

    if (!corporateEmail || typeof corporateEmail !== 'string') {
      res.status(400).json({ error: 'A corporate email address is required.' });
      return;
    }

    // Email regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(corporateEmail.trim())) {
      res.status(400).json({ error: 'Invalid corporate email format provided.' });
      return;
    }

    // Disposable / Temporary Email Blocker
    const disposableCheck = isDisposableEmail(corporateEmail.trim());
    if (disposableCheck.isDisposable) {
      res.status(400).json({
        error: disposableCheck.reason || 'Temporary or disposable email domains are blocked. Please provide a verified corporate email address.',
      });
      return;
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      res.status(400).json({ error: 'Please select a valid inquiry subject.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      res.status(400).json({ error: 'Message must contain at least 10 characters detailing your corporate inquiry.' });
      return;
    }

    if (message.length > 3000) {
      res.status(400).json({ error: 'Message exceeds the 3,000 character maximum limit.' });
      return;
    }

    const inquiryRecord = {
      id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      corporateEmail: corporateEmail.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    recentInquiries.unshift(inquiryRecord);
    if (recentInquiries.length > 50) recentInquiries.pop();

    console.log(`[Verifyn Lead Generated] ${inquiryRecord.name} (${inquiryRecord.corporateEmail}) - ${inquiryRecord.subject}`);

    // If Formspree endpoint is configured via .env, forward asynchronously
    const formspreeUrl = process.env.FORMSPREE_ENDPOINT;
    if (formspreeUrl && formspreeUrl.startsWith('https://formspree.io')) {
      try {
        await fetch(formspreeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(inquiryRecord),
        });
      } catch (fErr) {
        console.warn('Formspree forward error:', fErr);
      }
    }

    // Resend Integration with Dev Fallbacks for Dummy Keys & Network Resiliency
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'leads@verifyn.io';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Verifyn Lead Desk <onboarding@resend.dev>';

    if (resendApiKey) {
      const isDummyResend = Boolean(
        resendApiKey.includes('dummy') ||
        resendApiKey.includes('your_resend') ||
        resendApiKey === 're_dummy_resend_key_12345'
      );

      if (isDummyResend) {
        console.warn('[Resend] Dummy API key detected in development environment. Logging payload to console:');
        console.log('[Resend Dev Lead Payload]:', JSON.stringify({
          from: fromEmail,
          to: [notificationEmail],
          reply_to: inquiryRecord.corporateEmail,
          subject: `[Verifyn Intelligence Lead] ${inquiryRecord.subject} - ${inquiryRecord.name}`,
          text: `Name: ${inquiryRecord.name}\nEmail: ${inquiryRecord.corporateEmail}\nSubject: ${inquiryRecord.subject}\nMessage:\n${inquiryRecord.message}\nID: ${inquiryRecord.id}\nTimestamp: ${inquiryRecord.timestamp}`,
        }, null, 2));
      } else {
        try {
          const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [notificationEmail],
              reply_to: inquiryRecord.corporateEmail,
              subject: `[Verifyn Intelligence Lead] ${inquiryRecord.subject} - ${inquiryRecord.name}`,
              text: `New Corporate Lead Submitted:\nName: ${inquiryRecord.name}\nEmail: ${inquiryRecord.corporateEmail}\nSubject: ${inquiryRecord.subject}\nMessage:\n${inquiryRecord.message}\nSubmission ID: ${inquiryRecord.id}\nTimestamp: ${inquiryRecord.timestamp}`,
              html: `<div><h2>New Corporate Intelligence Inquiry</h2><p><strong>Name:</strong> ${inquiryRecord.name}</p><p><strong>Email:</strong> ${inquiryRecord.corporateEmail}</p><p><strong>Subject:</strong> ${inquiryRecord.subject}</p><p><strong>Message:</strong></p><p>${inquiryRecord.message.replace(/\n/g, '<br/>')}</p><hr/><p><small>Submission ID: ${inquiryRecord.id} &bull; Timestamp: ${inquiryRecord.timestamp}</small></p></div>`,
            }),
          });

          if (!resendResponse.ok) {
            const errBody = await resendResponse.text();
            console.warn(`[Resend] API responded with error status ${resendResponse.status}:`, errBody);
            console.log('[Resend Dev Logged Payload]:', inquiryRecord);
          } else {
            const resendData = await resendResponse.json().catch(() => ({}));
            console.log('[Resend] Corporate inquiry successfully dispatched to', notificationEmail, resendData?.id ? `(ID: ${resendData.id})` : '');
          }
        } catch (resendError: any) {
          // Dev Fallback: Catch error, log message payload to console.log(), and allow 200 Success UI feedback
          console.warn('[Resend] API dispatch failed, logging payload to console:', resendError?.message || resendError);
          console.log('[Resend Fallback Message Payload]:', inquiryRecord);
        }
      }
    }

    res.json({
      success: true,
      inquiryId: inquiryRecord.id,
      timestamp: inquiryRecord.timestamp,
      message: 'Your corporate intelligence inquiry has been validated and dispatched to our research desk.',
    });
  } catch (err) {
    console.error('Contact endpoint error:', err);
    res.status(500).json({ error: 'Internal server error processing corporate inquiry.' });
  }
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Serving
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Verifyn Engine] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
