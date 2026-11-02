import { describe, it, expect, vi } from "vitest";
import { StorefrontService } from "@/server/services/storefront.service";
import { SupabaseClient } from "@supabase/supabase-js";

describe("Storefront Visibility & Draft Isolation", () => {
  it("returns null when business is unpublished", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null, // Unpublished or non-existent
          error: { message: "Not found" },
        }),
      }),
    } as unknown as SupabaseClient;

    const service = new StorefrontService(mockSupabase);
    const result = await service.getPublicStorefrontBySlug("unpublished-caterer");

    expect(result).toBeNull();
  });
});
