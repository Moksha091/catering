import { SupabaseClient } from "@supabase/supabase-js";
import {
  PublicEnquiryInput,
  publicEnquirySchema,
} from "@/lib/validation/enquiry";
import { assertBusinessMembership } from "@/server/policies/tenant.policy";
import { Enquiry, EnquiryStatus } from "@/types/database";

export interface CreateEnquiryResult {
  enquiryId: string;
  referenceNumber: string;
  businessName: string;
  whatsappPhone: string | null;
}

export class EnquiryService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Submit an enquiry from the public storefront
   */
  async createPublicEnquiry(
    slug: string,
    input: PublicEnquiryInput
  ): Promise<CreateEnquiryResult> {
    const validated = publicEnquirySchema.parse(input);

    // Resolve published business
    const { data: business, error: bizError } = await this.supabase
      .from("businesses")
      .select("id, name, whatsapp_phone")
      .eq("slug", slug.toLowerCase().trim())
      .eq("published", true)
      .eq("status", "active")
      .single();

    if (bizError || !business) {
      throw new Error("This catering business is not available for enquiries.");
    }

    const { data: enquiry, error: enqError } = await this.supabase
      .from("enquiries")
      .insert({
        business_id: business.id,
        customer_name: validated.customerName,
        customer_phone: validated.customerPhone,
        customer_email: validated.customerEmail || null,
        event_type: validated.eventType || null,
        event_date: validated.eventDate || null,
        start_time: validated.startTime || null,
        guest_count: validated.guestCount || null,
        venue_address: validated.venueAddress || null,
        city: validated.city || null,
        selected_package_id: validated.selectedPackageId || null,
        customer_notes: validated.customerNotes || null,
        source: "storefront",
        status: "new",
      })
      .select("id")
      .single();

    if (enqError || !enquiry) {
      throw new Error(enqError?.message || "Failed to submit enquiry");
    }

    // Short reference number for customer confirmation
    const referenceNumber = `ENQ-${enquiry.id.slice(0, 8).toUpperCase()}`;

    return {
      enquiryId: enquiry.id,
      referenceNumber,
      businessName: business.name,
      whatsappPhone: business.whatsapp_phone,
    };
  }

  /**
   * List enquiries for a caterer's dashboard
   */
  async listBusinessEnquiries(
    businessId: string,
    statusFilter?: EnquiryStatus
  ): Promise<Enquiry[]> {
    await assertBusinessMembership(this.supabase, businessId);

    let query = this.supabase
      .from("enquiries")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Enquiry[];
  }

  /**
   * Update enquiry status (new, contacted, quote_sent, converted, declined, closed)
   */
  async updateEnquiryStatus(
    businessId: string,
    enquiryId: string,
    status: EnquiryStatus
  ): Promise<Enquiry> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("enquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", enquiryId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update enquiry status");
    }

    return data as Enquiry;
  }

  /**
   * Update internal caterer notes and follow-up date
   */
  async updateEnquiryNotes(
    businessId: string,
    enquiryId: string,
    internalNotes: string,
    followUpAt?: string | null
  ): Promise<Enquiry> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data, error } = await this.supabase
      .from("enquiries")
      .update({
        internal_notes: internalNotes || null,
        follow_up_at: followUpAt || null,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", enquiryId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update notes");
    }

    return data as Enquiry;
  }
}
