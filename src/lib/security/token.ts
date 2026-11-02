import crypto from "crypto";

/**
 * Generate a cryptographically secure random token (64 hex characters)
 */
export function generateQuoteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a raw token with SHA-256 before database storage or lookup
 */
export function hashQuoteToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim()).digest("hex");
}

/**
 * Perform constant-time verification to prevent timing attacks
 */
export function verifyQuoteToken(rawToken: string, storedHash: string): boolean {
  const computedHash = hashQuoteToken(rawToken);
  if (computedHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "utf-8"),
    Buffer.from(storedHash, "utf-8")
  );
}
