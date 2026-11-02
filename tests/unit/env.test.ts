import { describe, it, expect } from "vitest";
import { envSchema } from "@/lib/validation/env";

describe("Environment Variable Validation", () => {
  it("validates valid environment configuration", () => {
    const validConfig = {
      NEXT_PUBLIC_APP_URL: "https://rasoisync.in",
      NEXT_PUBLIC_DEFAULT_TIMEZONE: "Asia/Kolkata",
      NEXT_PUBLIC_SUPABASE_URL: "https://my-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "anon-key-12345",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key-99999",
    };

    const parsed = envSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.NEXT_PUBLIC_DEFAULT_TIMEZONE).toBe("Asia/Kolkata");
    }
  });

  it("fails when NEXT_PUBLIC_SUPABASE_URL is invalid", () => {
    const invalidConfig = {
      NEXT_PUBLIC_APP_URL: "https://rasoisync.in",
      NEXT_PUBLIC_SUPABASE_URL: "not-a-valid-url",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "anon-key-12345",
    };

    const parsed = envSchema.safeParse(invalidConfig);
    expect(parsed.success).toBe(false);
  });
});

