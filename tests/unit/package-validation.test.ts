import { describe, it, expect } from "vitest";
import {
  createPackageSchema,
  addPackageItemSchema,
} from "@/lib/validation/package";

describe("Package Validation Schemas", () => {
  it("validates a valid per-person catering package", () => {
    const valid = {
      name: "Deluxe Reception Package",
      description: "Welcome drinks + 4 starters + buffet + 2 desserts",
      pricingType: "per_person" as const,
      priceRupees: 750,
      minimumGuests: 100,
      maximumGuests: 1000,
      isPublished: true,
    };
    const res = createPackageSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects when maximum guests is less than minimum guests", () => {
    const invalid = {
      name: "Intimate Dinner Package",
      pricingType: "per_person" as const,
      priceRupees: 500,
      minimumGuests: 100,
      maximumGuests: 50, // invalid: max < min
    };
    const res = createPackageSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.errors[0].path).toContain("maximumGuests");
    }
  });

  it("requires priceRupees when pricingType is not quote_required", () => {
    const invalid = {
      name: "Budget Thali Package",
      pricingType: "per_person" as const,
      // priceRupees missing
    };
    const res = createPackageSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("allows omitting priceRupees when pricingType is quote_required", () => {
    const valid = {
      name: "Custom Destination Wedding Package",
      pricingType: "quote_required" as const,
      minimumGuests: 200,
    };
    const res = createPackageSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates package inclusion items", () => {
    const valid = {
      packageId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      itemNameSnapshot: "Hyderabadi Chicken Dum Biryani",
      quantityOrDescription: "Unlimited with Mirchi ka Salan & Raita",
    };
    const res = addPackageItemSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
