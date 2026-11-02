import { describe, it, expect } from "vitest";
import { calculateAuthoritativeQuoteTotals } from "@/lib/validation/quote";

describe("Authoritative Quote Financial Calculations", () => {
  it("calculates multi-item subtotal accurately in integer paise", () => {
    const input = {
      items: [
        {
          description: "Per Person Buffet (150 guests @ ₹650)",
          quantity: 150,
          unit: "guests",
          unitPriceRupees: 650,
        },
        {
          description: "Live Chaat Counter",
          quantity: 1,
          unit: "counter",
          unitPriceRupees: 15000,
        },
      ],
      discountRupees: 5000,
      taxRupees: 2500,
      additionalChargesRupees: 1000,
      depositRupees: 30000,
    };

    const totals = calculateAuthoritativeQuoteTotals(input);

    // Item 1: 150 * 65000 paise = 9,750,000 paise
    // Item 2: 1 * 1,500,000 paise = 1,500,000 paise
    // Subtotal: 11,250,000 paise (₹1,12,500)
    expect(totals.subtotalPaise).toBe(11250000);

    // Total: 11,250,000 - 500,000 + 250,000 + 100,000 = 11,100,000 paise (₹1,11,000)
    expect(totals.totalPaise).toBe(11100000);

    // Deposit: 30,000 INR = 3,000,000 paise
    expect(totals.depositPaise).toBe(3000000);
  });

  it("clamps deposit to total amount if deposit exceeds total", () => {
    const input = {
      items: [
        {
          description: "Small Snack Box",
          quantity: 10,
          unit: "boxes",
          unitPriceRupees: 100,
        },
      ],
      discountRupees: 0,
      taxRupees: 0,
      additionalChargesRupees: 0,
      depositRupees: 5000, // Exceeds total (₹1,000)
    };

    const totals = calculateAuthoritativeQuoteTotals(input);
    expect(totals.totalPaise).toBe(100000); // ₹1,000
    expect(totals.depositPaise).toBe(100000); // Clamped to total
  });
});
