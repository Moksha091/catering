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
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;
  const whatsappPhone = formData.get("whatsappPhone") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const addressText = formData.get("addressText") as string;

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
    const message = err instanceof Error ? err.message : "Failed to create business profile";
    return { error: message };
  }

  redirect("/dashboard");
}

