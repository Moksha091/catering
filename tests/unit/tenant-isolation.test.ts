import { describe, it, expect, vi } from "vitest";
import {
  assertBusinessMembership,
  UnauthorizedError,
  ForbiddenError,
} from "@/server/policies/tenant.policy";
import { SupabaseClient } from "@supabase/supabase-js";

describe("Tenant Isolation & Membership Policy", () => {
  it("throws UnauthorizedError when user is not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as unknown as SupabaseClient;

    await expect(
      assertBusinessMembership(mockSupabase, "biz-123")
    ).rejects.toThrow(UnauthorizedError);
  });

  it("throws ForbiddenError when user has no active membership for the requested business", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
      }),
    } as unknown as SupabaseClient;

    await expect(
      assertBusinessMembership(mockSupabase, "foreign-biz-456")
    ).rejects.toThrow(ForbiddenError);
  });

  it("allows access when user is an active member", async () => {
    const mockMember = {
      id: "membership-1",
      business_id: "biz-123",
      user_id: "user-1",
      role: "owner",
      status: "active",
    };

    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockMember, error: null }),
      }),
    } as unknown as SupabaseClient;

    const result = await assertBusinessMembership(mockSupabase, "biz-123");
    expect(result.business_id).toBe("biz-123");
    expect(result.role).toBe("owner");
  });

  it("blocks staff member when action explicitly requires owner role", async () => {
    const mockStaffMember = {
      id: "membership-2",
      business_id: "biz-123",
      user_id: "user-staff",
      role: "staff",
      status: "active",
    };

    const mockSupabase = {
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "user-staff" } }, error: null }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockStaffMember, error: null }),
      }),
    } as unknown as SupabaseClient;

    await expect(
      assertBusinessMembership(mockSupabase, "biz-123", "owner")
    ).rejects.toThrow(ForbiddenError);
  });
});

