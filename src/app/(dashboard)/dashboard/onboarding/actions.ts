"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessService } from "@/server/services/business.service";
import { createBusinessSchema } from "@/lib/validation/business";

export interface OnboardingState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createBusinessOnboardingAction(
  _prevState: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const name = ((formData.get("name") as string) || "").trim();
  const slug = ((formData.get("slug") as string) || "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const phone = ((formData.get("phone") as string) || "").trim();
  const whatsappPhone = ((formData.get("whatsappPhone") as string) || "").trim();
  const city = ((formData.get("city") as string) || "").trim();
  const state = ((formData.get("state") as string) || "").trim();
  const addressText = ((formData.get("addressText") as string) || "").trim();

  const validation = createBusinessSchema.safeParse({
    name,
    slug,
    description,
    phone,
    whatsappPhone,
    city,
    state,
    addressText,
  });

  if (!validation.success) {
    return {
      error: "Please fix the errors below",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const businessService = new BusinessService(supabase);

  try {
    await businessService.createBusiness(validation.data);
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);
    // Surface the real Supabase / Postgres error so users (and developers)
    // can see exactly what went wrong rather than a generic message.
    const message =
      raw.includes("violates foreign key") && raw.includes("profiles")
        ? "Your account profile could not be found. Please sign out and sign in again, then retry."
        : raw.includes("duplicate key") || raw.includes("already taken")
        ? raw
        : `Failed to create business profile: ${raw}`;
    return { error: message };
  }

  redirect("/dashboard");
}

