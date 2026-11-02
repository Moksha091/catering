import { describe, it, expect, vi } from "vitest";
import { MenuService } from "@/server/services/menu.service";
import { SupabaseClient } from "@supabase/supabase-js";

describe("MenuService Unit Tests", () => {
  it("converts price in rupees into integer paise on item creation", async () => {
    let insertedPayload: Record<string, unknown> | null = null;

    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "business_members") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { business_id: "biz-1", user_id: "user-1", role: "owner", status: "active" },
              error: null,
            }),
          };
        }
        if (table === "menu_items") {
          return {
            insert: vi.fn().mockImplementation((payload) => {
              insertedPayload = payload;
              return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: { id: "item-1", ...payload },
                  error: null,
                }),
              };
            }),
          };
        }
        return {};
      }),
    } as unknown as SupabaseClient;

    const service = new MenuService(mockSupabase);
    await service.createMenuItem("biz-1", {
      categoryId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      name: "Paneer Butter Masala",
      dietaryType: "veg",
      priceType: "fixed",
      priceRupees: 275.5, // 275.50 INR should convert to 27550 paise
      isAvailable: true,
    });

    expect(insertedPayload).not.toBeNull();
    // 275.5 * 100 = 27550
    expect((insertedPayload as Record<string, unknown> | null)?.price_paise).toBe(27550);
  });
});
