import { describe, it, expect } from "vitest";
import {
  createMenuSchema,
  createCategorySchema,
  createMenuItemSchema,
} from "@/lib/validation/menu";

describe("Menu & Dish Validation Schemas", () => {
  it("validates valid menu input", () => {
    const valid = {
      name: "Grand Wedding Buffet",
      description: "Complete spread for traditional wedding dinners",
      menuType: "Wedding",
    };
    const res = createMenuSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects menu name that is too short", () => {
    const invalid = {
      name: "M",
    };
    const res = createMenuSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates menu category creation", () => {
    const valid = {
      menuId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "North Indian Curries",
      description: "Served hot with butter naan",
      displayOrder: 1,
    };
    const res = createCategorySchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates menu item with fixed price", () => {
    const valid = {
      categoryId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "Paneer Tikka",
      description: "Charcoal grilled cottage cheese skewers",
      dietaryType: "veg" as const,
      priceType: "fixed" as const,
      priceRupees: 280,
      unitLabel: "plate",
      isAvailable: true,
    };
    const res = createMenuItemSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("requires priceRupees when priceType is fixed or per_person", () => {
    const invalid = {
      categoryId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "Mutton Rogan Josh",
      dietaryType: "non_veg" as const,
      priceType: "fixed" as const,
      // priceRupees missing
    };
    const res = createMenuItemSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("allows omitting priceRupees when priceType is quote_required or market_rate", () => {
    const validQuote = {
      categoryId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "Live Seafood Counter",
      dietaryType: "non_veg" as const,
      priceType: "quote_required" as const,
    };
    expect(createMenuItemSchema.safeParse(validQuote).success).toBe(true);

    const validMarket = {
      categoryId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "Alphonso Mango Kulfi",
      dietaryType: "veg" as const,
      priceType: "market_rate" as const,
    };
    expect(createMenuItemSchema.safeParse(validMarket).success).toBe(true);
  });
});
