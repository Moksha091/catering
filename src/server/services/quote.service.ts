import { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateQuoteInput,
  createQuoteSchema,
  calculateAuthoritativeQuoteTotals,
} from "@/lib/validation/quote";
import { assertBusinessMembership } from "@/server/policies/tenant.policy";
import {
  generateQuoteToken,
  hashQuoteToken,
} from "@/lib/security/token";
import { Quote, QuoteItem, Business, Booking } from "@/types/database";

export interface PublicQuoteDTO {
  quote: Quote;
  items: QuoteItem[];
  business: {
    name: string;
    phone: string | null;
    whatsapp_phone: string | null;
    city: string | null;
  };
}

export class QuoteService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Create a new versioned quote for an enquiry
   */
  async createQuote(
    businessId: string,
    enquiryId: string,
    input: CreateQuoteInput
  ): Promise<Quote> {
    await assertBusinessMembership(this.supabase, businessId);
    const validated = createQuoteSchema.parse(input);
    const totals = calculateAuthoritativeQuoteTotals(validated);

    // Determine next version number for this enquiry
    const { data: existingQuotes } = await this.supabase
      .from("quotes")
      .select("version")
      .eq("business_id", businessId)
      .eq("enquiry_id", enquiryId)
      .order("version", { ascending: false })
      .limit(1);

    const nextVersion =
      existingQuotes && existingQuotes.length > 0
        ? existingQuotes[0].version + 1
        : 1;

    // Generate preliminary token hash
    const initialRawToken = generateQuoteToken();
    const tokenHash = hashQuoteToken(initialRawToken);

    // 1. Insert Quote
    const { data: quote, error: quoteError } = await this.supabase
      .from("quotes")
      .insert({
        business_id: businessId,
        enquiry_id: enquiryId,
        version: nextVersion,
        public_token_hash: tokenHash,
        subtotal_paise: totals.subtotalPaise,
        discount_paise: totals.discountPaise,
        tax_paise: totals.taxPaise,
        additional_charges_paise: totals.additionalChargesPaise,
        total_paise: totals.totalPaise,
        deposit_paise: totals.depositPaise,
        notes: validated.notes || null,
        valid_until: validated.validUntil || null,
        status: "draft",
      })
      .select()
      .single();

    if (quoteError || !quote) {
      throw new Error(quoteError?.message || "Failed to create quote");
    }

    // 2. Insert Quote Items
    for (let i = 0; i < totals.items.length; i++) {
      const item = totals.items[i];
      await this.supabase.from("quote_items").insert({
        business_id: businessId,
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price_paise: item.unitPricePaise,
        line_total_paise: item.lineTotalPaise,
        display_order: i + 1,
      });
    }

    return quote as Quote;
  }

  /**
   * Send a quote: locks the version and generates the secure shareable token
   */
  async sendQuote(
    businessId: string,
    quoteId: string
  ): Promise<{ quote: Quote; rawToken: string }> {
    await assertBusinessMembership(this.supabase, businessId);

    const rawToken = generateQuoteToken();
    const publicTokenHash = hashQuoteToken(rawToken);

    const { data: quote, error } = await this.supabase
      .from("quotes")
      .update({
        public_token_hash: publicTokenHash,
        status: "sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", quoteId)
      .select()
      .single();

    if (error || !quote) {
      throw new Error(error?.message || "Failed to send quote");
    }

    // Update parent enquiry status to quote_sent
    await this.supabase
      .from("enquiries")
      .update({ status: "quote_sent", updated_at: new Date().toISOString() })
      .eq("id", quote.enquiry_id);

    return { quote: quote as Quote, rawToken };
  }

  /**
   * Look up public quote by customer's raw token
   */
  async getPublicQuoteByToken(rawToken: string): Promise<PublicQuoteDTO | null> {
    const tokenHash = hashQuoteToken(rawToken);

    const { data: quote, error: quoteError } = await this.supabase
      .from("quotes")
      .select("*, businesses(name, phone, whatsapp_phone, city)")
      .eq("public_token_hash", tokenHash)
      .single();

    if (quoteError || !quote) {
      return null;
    }

    const { data: items } = await this.supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("display_order", { ascending: true });

    const business = quote.businesses as unknown as Business;

    return {
      quote: quote as Quote,
      items: (items || []) as QuoteItem[],
      business: {
        name: business?.name || "Catering Service",
        phone: business?.phone || null,
        whatsapp_phone: business?.whatsapp_phone || null,
        city: business?.city || null,
      },
    };
  }

  /**
   * Accept quote and generate confirmed/pending booking
   */
  async acceptPublicQuote(rawToken: string): Promise<{ booking: Booking }> {
    const publicData = await this.getPublicQuoteByToken(rawToken);
    if (!publicData) {
      throw new Error("Quote not found or invalid token");
    }

    const { quote } = publicData;

    if (quote.status === "accepted") {
      // Idempotent acceptance
      const { data: existingBooking } = await this.supabase
        .from("bookings")
        .select("*")
        .eq("quote_id", quote.id)
        .single();

      if (existingBooking) {
        return { booking: existingBooking as Booking };
      }
    }

    if (quote.status !== "sent") {
      throw new Error(`This quote cannot be accepted because its status is ${quote.status}`);
    }

    // Check expiration
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      throw new Error("This quote has expired. Please contact the caterer for an updated quote.");
    }

    // Fetch parent enquiry for event date and guest details
    const { data: enquiry } = await this.supabase
      .from("enquiries")
      .select("*")
      .eq("id", quote.enquiry_id)
      .single();

    const bookingRef = `BK-${Date.now().toString().slice(-6)}`;
    const eventDate = enquiry?.event_date || new Date().toISOString().split("T")[0];

    // 1. Create booking
    const { data: booking, error: bookingError } = await this.supabase
      .from("bookings")
      .insert({
        business_id: quote.business_id,
        enquiry_id: quote.enquiry_id,
        quote_id: quote.id,
        booking_reference: bookingRef,
        event_date: eventDate,
        start_time: enquiry?.start_time || null,
        end_time: enquiry?.end_time || null,
        guest_count: enquiry?.guest_count || null,
        venue_address: enquiry?.venue_address || null,
        agreed_total_paise: quote.total_paise,
        deposit_due_paise: quote.deposit_paise,
        balance_due_paise: Math.max(0, quote.total_paise - quote.deposit_paise),
        status: "pending_confirmation",
      })
      .select()
      .single();

    if (bookingError || !booking) {
      throw new Error(bookingError?.message || "Failed to create booking from quote");
    }

    // 2. Mark quote accepted
    await this.supabase
      .from("quotes")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    // 3. Mark enquiry converted
    await this.supabase
      .from("enquiries")
      .update({
        status: "converted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", quote.enquiry_id);

    return { booking: booking as Booking };
  }

  /**
   * Customer declines quote
   */
  async declinePublicQuote(rawToken: string): Promise<void> {
    const publicData = await this.getPublicQuoteByToken(rawToken);
    if (!publicData) {
      throw new Error("Quote not found");
    }

    await this.supabase
      .from("quotes")
      .update({
        status: "declined",
        updated_at: new Date().toISOString(),
      })
      .eq("id", publicData.quote.id);
  }

  /**
   * List quotes for a business
   */
  async listBusinessQuotes(businessId: string): Promise<Quote[]> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("quotes")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Quote[];
  }
}

