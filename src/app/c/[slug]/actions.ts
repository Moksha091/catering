"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { EnquiryService, CreateEnquiryResult } from "@/server/services/enquiry.service";
import { publicEnquirySchema } from "@/lib/validation/enquiry";
import { checkRateLimit } from "@/lib/security/rate-limit";

export interface PublicEnquiryState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  result?: CreateEnquiryResult;
}

export async function submitPublicEnquiryAction(
  slug: string,
  _prevState: PublicEnquiryState | null,
  formData: FormData
): Promise<PublicEnquiryState> {
  // Rate limit check by client IP
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  const rateCheck = checkRateLimit(`enquiry_${clientIp}_${slug}`, {
    windowMs: 60000,
    maxRequests: 5,
  });

  if (!rateCheck.allowed) {
    return {
      error: `Too many submissions. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const eventType = formData.get("eventType") as string;
  const eventDate = formData.get("eventDate") as string;
  const startTime = formData.get("startTime") as string;
  const guestCountStr = formData.get("guestCount") as string;
  const venueAddress = formData.get("venueAddress") as string;
  const city = formData.get("city") as string;
  const selectedPackageId = formData.get("selectedPackageId") as string;
  const customerNotes = formData.get("customerNotes") as string;

  const guestCount = guestCountStr ? parseInt(guestCountStr, 10) : undefined;

  const validation = publicEnquirySchema.safeParse({
    customerName,
    customerPhone,
    customerEmail,
    eventType,
    eventDate,
    startTime,
    guestCount,
    venueAddress,
    city,
    selectedPackageId,
    customerNotes,
  });

  if (!validation.success) {
    return {
      error: "Please complete all required fields properly",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const enquiryService = new EnquiryService(supabase);
    const result = await enquiryService.createPublicEnquiry(slug, validation.data);

    return { result };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to submit enquiry",
    };
  }
}
