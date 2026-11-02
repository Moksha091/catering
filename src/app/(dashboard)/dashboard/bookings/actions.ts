"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/server/services/booking.service";
import { BusinessService } from "@/server/services/business.service";
import { BookingStatus } from "@/types/database";

async function getActiveBusinessId(): Promise<string> {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();
  if (!businesses.length) throw new Error("No active business found");
  return businesses[0].id;
}

export async function confirmBookingAction(bookingId: string): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const bookingService = new BookingService(supabase);
  await bookingService.confirmBooking(businessId, bookingId);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const businessId = await getActiveBusinessId();
  const bookingId = formData.get("bookingId") as string;
  const cancellationReason = formData.get("cancellationReason") as string;

  const supabase = await createClient();
  const bookingService = new BookingService(supabase);
  await bookingService.cancelBooking(businessId, bookingId, cancellationReason);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const businessId = await getActiveBusinessId();
  const supabase = await createClient();
  const bookingService = new BookingService(supabase);
  await bookingService.updateBookingStatus(businessId, bookingId, status);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}
