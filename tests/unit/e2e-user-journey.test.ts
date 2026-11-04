import { describe, it, expect, vi } from "vitest";
import { BusinessService } from "@/server/services/business.service";
import { StorefrontService } from "@/server/services/storefront.service";
import { SupabaseClient } from "@supabase/supabase-js";
import { createBusinessSchema } from "@/lib/validation/business";
import { publicEnquirySchema } from "@/lib/validation/enquiry";
import { isValidBookingTransition } from "@/lib/validation/booking";

describe("E2E Internal User Journey: Onboarding -> Menus -> Storefront -> Enquiry", () => {
  // Test fixture data
  const fakeUserId = "fake-caterer-uuid-001";
  const fakeUserEmail = "chef.ramesh@testcaterer.in";
  const fakeBusinessId = "biz-hyderabad-banquet-001";
  const fakeSlug = "taste-of-hyderabad";

  it("validates fake user onboarding payload against schema", () => {
    const fakeDetails = {
      name: "Taste of Hyderabad Caterers",
      slug: fakeSlug,
      description: "Authentic royal Hyderabadi wedding feasts, biryani live counters, and artisanal desserts.",
      phone: "+919876543210",
      whatsappPhone: "+919876543210",
      city: "Hyderabad",
      state: "Telangana",
      addressText: "Plot 108, Hitech City Main Road",
    };

    const validation = createBusinessSchema.safeParse(fakeDetails);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.slug).toBe("taste-of-hyderabad");
      expect(validation.data.city).toBe("Hyderabad");
    }
  });

  it("simulates full BusinessService.createBusiness and getUserBusinesses flow", async () => {
    const inMemoryProfiles = new Map<string, Record<string, unknown>>();
    const inMemoryBusinesses = new Map<string, Record<string, unknown>>();
    const inMemoryMembers = new Map<string, Record<string, unknown>>();

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: fakeUserId,
              email: fakeUserEmail,
              user_metadata: { full_name: "Chef Ramesh", phone: "+919876543210" },
            },
          },
          error: null,
        }),
      },
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return {
            upsert: vi.fn().mockImplementation((payload) => {
              inMemoryProfiles.set(payload.id, payload);
              return { data: payload, error: null };
            }),
          };
        }
        if (table === "businesses") {
          return {
            select: vi.fn().mockImplementation((_cols?: string) => {
              return {
                eq: vi.fn().mockImplementation((field: string, val: string) => {
                  if (field === "slug") {
                    const match = Array.from(inMemoryBusinesses.values()).filter(
                      (b) => b.slug === val
                    );
                    return { data: match, error: null };
                  }
                  if (field === "owner_id") {
                    return {
                      eq: vi.fn().mockImplementation((_f2: string, _v2: string) => {
                        const match = Array.from(inMemoryBusinesses.values()).filter(
                          (b) => b.owner_id === val
                        );
                        return { data: match, error: null };
                      }),
                    };
                  }
                  return { data: [], error: null };
                }),
              };
            }),
            insert: vi.fn().mockImplementation((payload) => {
              const record = { id: fakeBusinessId, ...payload };
              inMemoryBusinesses.set(fakeBusinessId, record);
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: record, error: null }),
              };
            }),
          };
        }
        if (table === "business_members") {
          return {
            insert: vi.fn().mockImplementation((payload) => {
              inMemoryMembers.set(`${payload.business_id}-${payload.user_id}`, payload);
              return { data: payload, error: null };
            }),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const businessService = new BusinessService(mockSupabase);

    // 1. Create Business
    const business = await businessService.createBusiness({
      name: "Taste of Hyderabad Caterers",
      slug: fakeSlug,
      description: "Authentic Hyderabadi feast",
      phone: "+919876543210",
      whatsappPhone: "+919876543210",
      city: "Hyderabad",
      state: "Telangana",
    });

    expect(business.id).toBe(fakeBusinessId);
    expect(business.slug).toBe(fakeSlug);
    expect(business.published).toBe(true);
    expect(inMemoryProfiles.has(fakeUserId)).toBe(true);

    // 2. Fetch User Businesses
    const userBusinesses = await businessService.getUserBusinesses();
    expect(userBusinesses.length).toBe(1);
    expect(userBusinesses[0].name).toBe("Taste of Hyderabad Caterers");
  });

  it("simulates menu creation and verifies storefront aggregates menus, dishes, and packages", async () => {
    const fakeMenuId = "menu-wedding-001";
    const fakeCatId = "cat-starters-001";
    const fakeDishId = "dish-paneer-001";
    const fakePkgId = "pkg-royal-001";

    const mockBusiness = {
      id: fakeBusinessId,
      name: "Taste of Hyderabad Caterers",
      slug: fakeSlug,
      published: true,
      status: "active",
      city: "Hyderabad",
    };

    const mockMenus = [
      {
        id: fakeMenuId,
        business_id: fakeBusinessId,
        name: "Royal Wedding Feast",
        status: "published",
        display_order: 1,
      },
    ];

    const mockCategories = [
      {
        id: fakeCatId,
        business_id: fakeBusinessId,
        menu_id: fakeMenuId,
        name: "Welcome Starters",
        display_order: 1,
      },
    ];

    const mockItems = [
      {
        id: fakeDishId,
        business_id: fakeBusinessId,
        category_id: fakeCatId,
        name: "Paneer Tikka Angara",
        price_paise: 25000,
        price_type: "fixed",
        dietary_type: "veg",
        is_available: true,
        display_order: 1,
      },
    ];

    const mockPackages = [
      {
        id: fakePkgId,
        business_id: fakeBusinessId,
        name: "Grand Banquet Package",
        pricing_type: "per_person",
        price_paise: 75000,
        minimum_guests: 50,
        is_published: true,
        display_order: 1,
      },
    ];

    const mockPackageItems = [
      {
        id: "pi-001",
        business_id: fakeBusinessId,
        package_id: fakePkgId,
        menu_item_id: fakeDishId,
        item_name_snapshot: "Paneer Tikka Angara",
        display_order: 1,
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "businesses") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockBusiness, error: null }),
          };
        }
        if (table === "menus") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockMenus, error: null }),
          };
        }
        if (table === "menu_categories") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
          };
        }
        if (table === "menu_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
          };
        }
        if (table === "packages") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockPackages, error: null }),
          };
        }
        if (table === "package_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockPackageItems, error: null }),
          };
        }
        if (table === "service_areas") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const storefrontService = new StorefrontService(mockSupabase);
    const result = await storefrontService.getPublicStorefrontBySlug(fakeSlug);

    expect(result).not.toBeNull();
    expect(result?.business.name).toBe("Taste of Hyderabad Caterers");
    expect(result?.menus.length).toBe(1);
    expect(result?.menus[0].categories.length).toBe(1);
    expect(result?.menus[0].categories[0].items.length).toBe(1);
    expect(result?.menus[0].categories[0].items[0].name).toBe("Paneer Tikka Angara");
    expect(result?.packages.length).toBe(1);
    expect(result?.packages[0].items.length).toBe(1);
    expect(result?.packages[0].items[0].item_name_snapshot).toBe("Paneer Tikka Angara");
  });

  it("validates customer public enquiry submission", () => {
    const customerEnquiry = {
      businessId: fakeBusinessId,
      customerName: "Ananya Sharma",
      customerPhone: "+919876500000",
      customerEmail: "ananya@example.com",
      eventDate: "2026-12-15",
      eventType: "Wedding Reception",
      guestCount: 250,
      dietaryPreference: "veg_and_non_veg",
      city: "Hyderabad",
      notes: "Need live tandoor and chaat counters.",
    };

    const validation = publicEnquirySchema.safeParse(customerEnquiry);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.guestCount).toBe(250);
      expect(validation.data.customerName).toBe("Ananya Sharma");
    }
  });

  it("verifies booking lifecycle transitions (pending_confirmation -> confirmed -> in_progress -> completed)", () => {
    // Valid forward transitions
    expect(isValidBookingTransition("pending_confirmation", "confirmed")).toBe(true);
    expect(isValidBookingTransition("confirmed", "in_progress")).toBe(true);
    expect(isValidBookingTransition("in_progress", "completed")).toBe(true);

    // Cancellation from active states
    expect(isValidBookingTransition("pending_confirmation", "cancelled")).toBe(true);
    expect(isValidBookingTransition("confirmed", "cancelled")).toBe(true);

    // Terminal states cannot transition
    expect(isValidBookingTransition("completed", "pending_confirmation")).toBe(false);
    expect(isValidBookingTransition("cancelled", "confirmed")).toBe(false);
  });
});
