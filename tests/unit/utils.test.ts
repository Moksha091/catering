import { describe, it, expect } from "vitest";
import { formatPaiseToINR, rupeesToPaise } from "@/lib/utils";

describe("Currency & Financial Calculations", () => {
  it("formats integer paise to INR correctly without decimals for whole numbers", () => {
    // 150000 paise = 1500 INR
    const formatted = formatPaiseToINR(150000);
    expect(formatted).toContain("1,500");
  });

  it("formats paise with fractional rupees accurately", () => {
    // 2550 paise = 25.50 INR
    const formatted = formatPaiseToINR(2550);
    expect(formatted).toContain("25.5");
  });

  it("handles zero paise", () => {
    const formatted = formatPaiseToINR(0);
    expect(formatted).toContain("0");
  });

  it("converts rupees to paise accurately without floating-point drift", () => {
    expect(rupeesToPaise(150)).toBe(15000);
    expect(rupeesToPaise(499.5)).toBe(49950);
    expect(rupeesToPaise(0)).toBe(0);
  });
});
