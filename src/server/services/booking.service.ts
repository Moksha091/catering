import { SupabaseClient } from "@supabase/supabase-js";
import {
  isValidBookingTransition,
} from "@/lib/validation/booking";
import { assertBusinessMembership } from "@/server/policies/tenant.policy";
import { Booking, BookingStatus } from "@/types/database";

export interface BookingWithDetails extends Booking {
  hasConflictWarning?: boolean;
}

export class BookingService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * List all bookings for a caterer, tagging date conflict warnings
   */
  async listBusinessBookings(businessId: string): Promise<BookingWithDetails[]> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data: bookings, error } = await this.supabase
      .from("bookings")
      .select("*")
      .eq("business_id", businessId)
      .order("event_date", { ascending: true });

    if (error) throw error;
    if (!bookings) return [];

    // Count confirmed bookings per date to flag capacity overlaps
    const confirmedDatesCount = new Map<string, number>();
    for (const b of bookings) {
      if (b.status === "confirmed") {
        confirmedDatesCount.set(
          b.event_date,
          (confirmedDatesCount.get(b.event_date) || 0) + 1
        );
      }
    }

    return bookings.map((b) => ({
      ...(b as Booking),
      hasConflictWarning: (confirmedDatesCount.get(b.event_date) || 0) > 1,
    }));
  }

  /**
   * Confirm booking with state transition validation
   */
  async confirmBooking(
    businessId: string,
    bookingId: string
  ): Promise<Booking> {
    const member = await assertBusinessMembership(this.supabase, businessId);

    const { data: existing, error: findError } = await this.supabase
      .from("bookings")
      .select("*")
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .single();

    if (findError || !existing) {
      throw new Error("Booking not found");
    }

    if (!isValidBookingTransition(existing.status, "confirmed")) {
      throw new Error(`Cannot transition booking from ${existing.status} to confirmed`);
    }

    const { data: updated, error: updateError } = await this.supabase
      .from("bookings")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "Failed to confirm booking");
    }

    // Record audit log
    await this.supabase.from("audit_logs").insert({
      business_id: businessId,
      actor_user_id: member.user_id,
      action: "booking_confirmed",
      entity_type: "booking",
      entity_id: bookingId,
      metadata: {
        booking_reference: existing.booking_reference,
        event_date: existing.event_date,
      },
    });

    return updated as Booking;
  }

  /**
   * Cancel booking with mandatory cancellation reason
   */
  async cancelBooking(
    businessId: string,
    bookingId: string,
    cancellationReason: string
  ): Promise<Booking> {
    const member = await assertBusinessMembership(this.supabase, businessId);

    const { data: existing, error: findError } = await this.supabase
      .from("bookings")
      .select("*")
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .single();

    if (findError || !existing) {
      throw new Error("Booking not found");
    }

    if (!isValidBookingTransition(existing.status, "cancelled")) {
      throw new Error(`Cannot cancel a booking that is already ${existing.status}`);
    }

    const { data: updated, error: updateError } = await this.supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: cancellationReason,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message || "Failed to cancel booking");
    }

    // Record audit log
    await this.supabase.from("audit_logs").insert({
      business_id: businessId,
      actor_user_id: member.user_id,
      action: "booking_cancelled",
      entity_type: "booking",
      entity_id: bookingId,
      metadata: {
        reason: cancellationReason,
        booking_reference: existing.booking_reference,
      },
    });

    return updated as Booking;
  }

  /**
   * Update booking status to in_progress or completed
   */
  async updateBookingStatus(
    businessId: string,
    bookingId: string,
    nextStatus: BookingStatus
  ): Promise<Booking> {
    await assertBusinessMembership(this.supabase, businessId);

    const { data: existing, error: findError } = await this.supabase
      .from("bookings")
      .select("*")
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .single();

    if (findError || !existing) {
      throw new Error("Booking not found");
    }

    if (!isValidBookingTransition(existing.status, nextStatus)) {
      throw new Error(`Invalid status transition from ${existing.status} to ${nextStatus}`);
    }

    const { data: updated, error } = await this.supabase
      .from("bookings")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("id", bookingId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(error?.message || "Failed to update booking status");
    }

    return updated as Booking;
  }
}

