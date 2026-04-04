/**
 * In-memory rate limiting for OTP flows.
 * NOTE: state resets on server restart and is not shared across multiple instances.
 * For multi-instance production (e.g. multiple Vercel regions), replace with a
 * Redis-backed solution such as @vercel/kv or Upstash.
 */

type AttemptEntry = { count: number; firstAttempt: number };

const requestLimits = new Map<string, AttemptEntry>();
const attemptLimits = new Map<string, AttemptEntry>();

/**
 * Limits how often a key (email or phone) can trigger an OTP/magic-link request.
 * Returns false (rate limited) if `maxRequests` have been made within `windowMs` ms.
 */
export function checkRequestLimit(
  key: string,
  maxRequests = 2,
  windowMs = 2 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = requestLimits.get(key);
  if (!entry || now - entry.firstAttempt > windowMs) {
    requestLimits.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/**
 * Tracks failed OTP verification attempts per key (email or phone).
 * Returns false if the key has reached `maxAttempts` within `windowMs` ms.
 * Increments the counter on every call — clear it on successful verification.
 */
export function checkVerifyAttempts(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = attemptLimits.get(key);
  if (!entry || now - entry.firstAttempt > windowMs) {
    attemptLimits.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

/** Clear attempt tracking after a successful verification. */
export function clearVerifyAttempts(key: string): void {
  attemptLimits.delete(key);
}
