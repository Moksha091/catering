"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QuoteService } from "@/server/services/quote.service";
import { BusinessService } from "@/server/services/business.service";

export interface CreateQuoteActionState {
  error?: string;
  success?: boolean;
}

async function getActiveBusinessId(): Promise<string> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();
  if (!businesses.length) throw new Error("No active business found");
  return businesses[0].id;
}

export async function createQuoteAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const enquiryId = formData.get("enquiryId") as string;
  const description = formData.get("description") as string;
  const quantityStr = formData.get("quantity") as string;
  const unit = formData.get("unit") as string;
  const unitPriceStr = formData.get("unitPriceRupees") as string;
  const validUntil = formData.get("validUntil") as string;
  const notes = formData.get("notes") as string;
  const discountStr = formData.get("discountRupees") as string;
  const taxStr = formData.get("taxRupees") as string;
  const depositStr = formData.get("depositRupees") as string;

  const quantity = parseFloat(quantityStr || "1");
  const unitPriceRupees = parseFloat(unitPriceStr || "0");
  const discountRupees = discountStr ? parseFloat(discountStr) : 0;
  const taxRupees = taxStr ? parseFloat(taxStr) : 0;
  const depositRupees = depositStr ? parseFloat(depositStr) : 0;

  const supabase = await createClient();
  const quoteService = new QuoteService(supabase);

  await quoteService.createQuote(businessId, enquiryId, {
    validUntil: validUntil || undefined,
    notes: notes || undefined,
    discountRupees,
    taxRupees,
    additionalChargesRupees: 0,
    depositRupees,
    items: [
      {
        description,
        quantity,
        unit: unit || "persons",
        unitPriceRupees,
      },
    ],
  });

  revalidatePath("/dashboard/quotes");
  revalidatePath("/dashboard/enquiries");
}

export async function sendQuoteAction(quoteId: string): Promise<string> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const quoteService = new QuoteService(supabase);
  const { rawToken } = await quoteService.sendQuote(businessId, quoteId);

  revalidatePath("/dashboard/quotes");
  return rawToken;
}
