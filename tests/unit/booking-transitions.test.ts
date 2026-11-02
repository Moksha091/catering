import { describe, it, expect } from "vitest";
import { isValidBookingTransition } from "@/lib/validation/booking";

describe("Booking State Transition Machine", () => {
  it("allows valid forward transitions", () => {
    // pending -> confirmed -> in_progress -> completed
    expect(isValidBookingTransition("pending_confirmation", "confirmed")).toBe(true);
    expect(isValidBookingTransition("confirmed", "in_progress")).toBe(true);
    expect(isValidBookingTransition("in_progress", "completed")).toBe(true);
  });

  it("allows cancellation from pending, confirmed, and in_progress", () => {
    expect(isValidBookingTransition("pending_confirmation", "cancelled")).toBe(true);
    expect(isValidBookingTransition("confirmed", "cancelled")).toBe(true);
    expect(isValidBookingTransition("in_progress", "cancelled")).toBe(true);
  });

  it("rejects invalid or backward state transitions", () => {
    expect(isValidBookingTransition("completed", "pending_confirmation")).toBe(false);
    expect(isValidBookingTransition("completed", "confirmed")).toBe(false);
    expect(isValidBookingTransition("completed", "cancelled")).toBe(false);
    expect(isValidBookingTransition("cancelled", "confirmed")).toBe(false);
    expect(isValidBookingTransition("in_progress", "pending_confirmation")).toBe(false);
  });
});
