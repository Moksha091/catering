import { describe, it, expect } from "vitest";
import { slugify, isValidSlug, RESERVED_SLUGS } from "@/lib/validation/business";

describe("Slug Utilities & Validation", () => {
  it("converts strings with spaces and special characters into clean slugs", () => {
    expect(slugify("Annapurna Caterers & Events")).toBe("annapurna-caterers-events");
    expect(slugify("Shree Krishna 2026!")).toBe("shree-krishna-2026");
    expect(slugify("   Leading & Trailing Spaces   ")).toBe("leading-trailing-spaces");
    expect(slugify("Multi----hyphens")).toBe("multi-hyphens");
  });

  it("identifies valid slugs correctly", () => {
    expect(isValidSlug("annapurna-caterers")).toBe(true);
    expect(isValidSlug("royal-treats-123")).toBe(true);
    expect(isValidSlug("delhi-chaat-bhandar")).toBe(true);
  });

  it("rejects invalid slugs (too short, uppercase, or invalid characters)", () => {
    expect(isValidSlug("ab")).toBe(false); // Too short (< 3)
    expect(isValidSlug("Annapurna")).toBe(false); // Uppercase
    expect(isValidSlug("annapurna_caterers")).toBe(false); // Underscores not allowed in URL slug
    expect(isValidSlug("-leading-hyphen")).toBe(false);
    expect(isValidSlug("trailing-hyphen-")).toBe(false);
  });

  it("rejects all reserved slugs", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isValidSlug(reserved)).toBe(false);
    }
    expect(isValidSlug("dashboard")).toBe(false);
    expect(isValidSlug("api")).toBe(false);
    expect(isValidSlug("sign-in")).toBe(false);
  });
});

