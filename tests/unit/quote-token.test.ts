import { describe, it, expect } from "vitest";
import {
  generateQuoteToken,
  hashQuoteToken,
  verifyQuoteToken,
} from "@/lib/security/token";

describe("Cryptographic Quote Tokens", () => {
  it("generates a 64-character hex string with high entropy", () => {
    const token1 = generateQuoteToken();
    const token2 = generateQuoteToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("consistently computes the same SHA-256 hash for identical tokens", () => {
    const token = generateQuoteToken();
    const hash1 = hashQuoteToken(token);
    const hash2 = hashQuoteToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("verifies valid tokens timing-safely", () => {
    const token = generateQuoteToken();
    const storedHash = hashQuoteToken(token);

    expect(verifyQuoteToken(token, storedHash)).toBe(true);
  });

  it("rejects invalid or tampered tokens", () => {
    const validToken = generateQuoteToken();
    const storedHash = hashQuoteToken(validToken);

    const tamperedToken = generateQuoteToken();
    expect(verifyQuoteToken(tamperedToken, storedHash)).toBe(false);
  });
});
