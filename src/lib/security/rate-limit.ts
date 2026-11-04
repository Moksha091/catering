/**
 * In-memory sliding window rate limiter for public forms and public token lookups
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  windowMs: number; // Window size in milliseconds
  maxRequests: number; // Maximum allowed requests within window
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 5 }
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };

  // Filter out timestamps outside the active window
  const activeTimestamps = record.timestamps.filter((t) => t > windowStart);

  if (activeTimestamps.length >= options.maxRequests) {
    const oldest = activeTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + options.windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  activeTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: options.maxRequests - activeTimestamps.length,
    retryAfterSeconds: 0,
  };
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

