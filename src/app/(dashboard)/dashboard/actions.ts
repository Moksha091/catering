"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BusinessService } from "@/server/services/business.service";

export async function togglePublishAction(
  businessId: string,
  currentStatus: boolean
): Promise<void> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  await businessService.setPublished(businessId, !currentStatus);
  revalidatePath("/dashboard");
}
