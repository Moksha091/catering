import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, clearRateLimitStore } from "@/lib/security/rate-limit";

describe("Sliding Window Rate Limiter", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("permits requests within allowed quota", () => {
    const opts = { windowMs: 5000, maxRequests: 3 };

    expect(checkRateLimit("client-1", opts).allowed).toBe(true);
    expect(checkRateLimit("client-1", opts).allowed).toBe(true);
    expect(checkRateLimit("client-1", opts).allowed).toBe(true);
  });

  it("blocks requests that exceed the quota", () => {
    const opts = { windowMs: 5000, maxRequests: 2 };

    expect(checkRateLimit("client-2", opts).allowed).toBe(true);
    expect(checkRateLimit("client-2", opts).allowed).toBe(true);

    const blocked = checkRateLimit("client-2", opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
