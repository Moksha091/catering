import { describe, it, expect } from "vitest";
import { createBusinessSchema } from "@/lib/validation/business";

describe("Business Profile Validation Schema", () => {
  const validBusinessData = {
    name: "Annapurna Caterers",
    slug: "annapurna-caterers",
    description: "Authentic traditional catering services for weddings and festivals.",
    phone: "+91 9876543210",
    whatsappPhone: "+91 9876543210",
    city: "Hyderabad",
    state: "Telangana",
    addressText: "Banjara Hills Road 12",
  };

  it("accepts valid business profile data", () => {
    const result = createBusinessSchema.safeParse(validBusinessData);
    expect(result.success).toBe(true);
  });

  it("rejects business name that is too short", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusinessData,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects reserved slug names", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusinessData,
      slug: "dashboard",
    });
    expect(result.success).toBe(false);
  });

  it("rejects phone numbers with fewer than 10 digits", () => {
    const result = createBusinessSchema.safeParse({
      ...validBusinessData,
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });
});
