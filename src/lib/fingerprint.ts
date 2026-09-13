import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedVisitorId: string | null = null;
let fpPromise: ReturnType<typeof FingerprintJS.load> | null = null;

/**
 * Initializes and retrieves the immutable device / browser fingerprint.
 * Works seamlessly across Incognito, private browsing, and cookie resets.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (cachedVisitorId) {
    return cachedVisitorId;
  }

  // Check localStorage if available as immediate cache
  try {
    const stored = localStorage.getItem('verifyn_visitor_id');
    if (stored && stored.length >= 8) {
      cachedVisitorId = stored;
    }
  } catch (e) {
    // localStorage might be blocked in strict private mode
  }

  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    if (result && result.visitorId) {
      cachedVisitorId = result.visitorId;
      try {
        localStorage.setItem('verifyn_visitor_id', result.visitorId);
      } catch (e) {
        // ignore
      }
      return result.visitorId;
    }
  } catch (err) {
    console.warn('[Fingerprint] FingerprintJS load error, using canvas/hardware fallback hash:', err);
  }

  // Fallback hardware/canvas fingerprint if script is blocked
  const fallback = generateHardwareFallbackHash();
  cachedVisitorId = fallback;
  return fallback;
}

/**
 * Robust secondary fallback computing a hardware & canvas hash
 */
function generateHardwareFallbackHash(): string {
  try {
    const nav = window.navigator;
    const screen = window.screen;
    const components: string[] = [
      nav.userAgent || '',
      nav.language || '',
      String(screen.colorDepth || 24),
      String(screen.width || 1920) + 'x' + String(screen.height || 1080),
      String(new Date().getTimezoneOffset()),
      String(nav.hardwareConcurrency || 4),
    ];

    // Canvas fingerprinting
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('VerifynHardwareSecurity,1029', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('VerifynHardwareSecurity,1029', 4, 17);
      components.push(canvas.toDataURL());
    }

    const str = components.join('###');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'hw_' + Math.abs(hash).toString(16) + '_' + (screen.width || 0);
  } catch (e) {
    return 'fp_dev_' + Math.random().toString(36).substring(2, 12);
  }
}
