import { z } from "zod";
import { BookingStatus } from "@/types/database";

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function isValidBookingTransition(
  current: BookingStatus,
  target: BookingStatus
): boolean {
  if (current === target) return true;
  return ALLOWED_TRANSITIONS[current]?.includes(target) ?? false;
}

export const confirmBookingSchema = z.object({
  bookingId: z.string().uuid(),
  depositReceivedRupees: z.coerce.number().nonnegative().optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
  cancellationReason: z
    .string()
    .trim()
    .min(3, "Cancellation reason must be provided")
    .max(500),
});

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum([
    "pending_confirmation",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ]),
});
