import { describe, it, expect } from "vitest";
import { publicEnquirySchema } from "@/lib/validation/enquiry";

describe("Public Enquiry Validation", () => {
  it("validates valid enquiry submission", () => {
    const valid = {
      customerName: "Siddharth Rao",
      customerPhone: "+91 9876543210",
      customerEmail: "siddharth@example.com",
      eventType: "Wedding Reception",
      eventDate: "2026-12-15",
      guestCount: 250,
      venueAddress: "Taj Krishna Banquet Hall",
      city: "Hyderabad",
      customerNotes: "Requires pure vegetarian buffet with separate Jain counter.",
    };

    const res = publicEnquirySchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects phone numbers with fewer than 10 digits", () => {
    const invalid = {
      customerName: "Siddharth Rao",
      customerPhone: "98765", // Only 5 digits
    };

    const res = publicEnquirySchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("rejects customer name that is too short", () => {
    const invalid = {
      customerName: "A",
      customerPhone: "+91 9876543210",
    };

    const res = publicEnquirySchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

