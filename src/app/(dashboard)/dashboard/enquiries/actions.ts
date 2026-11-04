"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EnquiryService } from "@/server/services/enquiry.service";
import { BusinessService } from "@/server/services/business.service";
import { EnquiryStatus } from "@/types/database";

async function getActiveBusinessId(): Promise<string> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();
  if (!businesses.length) throw new Error("No active business found");
  return businesses[0].id;
}

export async function updateEnquiryStatusAction(
  enquiryId: string,
  status: EnquiryStatus
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const enquiryService = new EnquiryService(supabase);
  await enquiryService.updateEnquiryStatus(businessId, enquiryId, status);

  revalidatePath("/dashboard/enquiries");
  revalidatePath("/dashboard");
}

export async function updateEnquiryNotesAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const enquiryId = formData.get("enquiryId") as string;
  const internalNotes = formData.get("internalNotes") as string;
  const followUpAt = formData.get("followUpAt") as string;

  const supabase = await createClient();
  const enquiryService = new EnquiryService(supabase);
  await enquiryService.updateEnquiryNotes(
    businessId,
    enquiryId,
    internalNotes,
    followUpAt || null
  );

  revalidatePath("/dashboard/enquiries");
}

