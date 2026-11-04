"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QuoteService } from "@/server/services/quote.service";

export interface PublicQuoteActionState {
  error?: string;
  success?: boolean;
  bookingReference?: string;
}

export async function acceptPublicQuoteAction(
  token: string
): Promise<PublicQuoteActionState> {
  try {
    const supabase = await createClient();
    const quoteService = new QuoteService(supabase);
    const result = await quoteService.acceptPublicQuote(token);

    revalidatePath(`/quote/${token}`);
    return {
      success: true,
      bookingReference: result.booking.booking_reference,
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to accept quote",
    };
  }
}

export async function declinePublicQuoteAction(
  token: string
): Promise<PublicQuoteActionState> {
  try {
    const supabase = await createClient();
    const quoteService = new QuoteService(supabase);
    await quoteService.declinePublicQuote(token);

    revalidatePath(`/quote/${token}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to decline quote",
    };
  }
}

