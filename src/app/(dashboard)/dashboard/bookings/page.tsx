import * as React from "react";
import {
  CalendarCheck,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookingService } from "@/server/services/booking.service";
import { BusinessService } from "@/server/services/business.service";
import {
  confirmBookingAction,
  cancelBookingAction,
  updateBookingStatusAction,
} from "@/app/(dashboard)/dashboard/bookings/actions";
import { formatPaiseToINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BookingsDashboardPage() {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();

  if (!businesses.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please create a business profile first.</p>
      </div>
    );
  }

  const business = businesses[0];
  const bookingService = new BookingService(supabase);
  const bookings = await bookingService.listBusinessBookings(business.id);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Event Bookings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Confirmed catering contracts, event schedules, and deposit tracking.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-dashed p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">No bookings yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Bookings are created when a customer accepts an official quotation, or when confirmed manually from an enquiry.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-bold">
                        Ref: {booking.booking_reference}
                      </CardTitle>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : booking.status === "in_progress"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : booking.status === "completed"
                            ? "bg-muted text-muted-foreground border"
                            : booking.status === "cancelled"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {booking.status.replace("_", " ").toUpperCase()}
                      </span>

                      {/* Date Overlap Alert */}
                      {booking.hasConflictWarning && booking.status === "confirmed" && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Multiple Events On Date</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      Event Date:{" "}
                      <span className="font-semibold text-foreground">
                        {new Date(booking.event_date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold text-foreground">
                      {formatPaiseToINR(booking.agreed_total_paise)}
                    </span>
                    <div className="text-xs text-muted-foreground space-x-2">
                      <span>Deposit: {formatPaiseToINR(booking.deposit_due_paise)}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">
                        Balance: {formatPaiseToINR(booking.balance_due_paise)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/20 p-3 rounded-lg border text-xs">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Guests
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {booking.guest_count ? `${booking.guest_count} persons` : "TBD"}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Timing
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {booking.start_time
                        ? `${booking.start_time}${booking.end_time ? ` - ${booking.end_time}` : ""}`
                        : "Full Day / Flexible"}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Venue
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block truncate">
                      {booking.venue_address || "To be provided by client"}
                    </span>
                  </div>
                </div>

                {booking.cancellation_reason && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs">
                    <span className="font-bold">Cancellation Reason: </span>
                    <span>{booking.cancellation_reason}</span>
                  </div>
                )}

                {/* State Machine Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Confirm Booking */}
                    {booking.status === "pending_confirmation" && (
                      <form
                        action={async () => {
                          "use server";
                          await confirmBookingAction(booking.id);
                        }}
                      >
                        <Button
                          size="sm"
                          type="submit"
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="mr-1 h-3.5 w-3.5" />
                          Confirm Booking
                        </Button>
                      </form>
                    )}

                    {/* Mark In Progress */}
                    {booking.status === "confirmed" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateBookingStatusAction(booking.id, "in_progress");
                        }}
                      >
                        <Button size="sm" variant="outline" type="submit" className="h-7 text-xs">
                          Start Event
                        </Button>
                      </form>
                    )}

                    {/* Complete Event */}
                    {booking.status === "in_progress" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateBookingStatusAction(booking.id, "completed");
                        }}
                      >
                        <Button size="sm" type="submit" className="h-7 text-xs">
                          Mark Completed
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Cancel Booking Form */}
                  {booking.status !== "completed" && booking.status !== "cancelled" && (
                    <details className="ml-auto">
                      <summary className="cursor-pointer text-xs text-rose-600 hover:underline">
                        Cancel Booking
                      </summary>
                      <form
                        action={cancelBookingAction}
                        className="mt-2 flex gap-2 items-center bg-muted/40 p-2 rounded border"
                      >
                        <input type="hidden" name="bookingId" value={booking.id} />
                        <Input
                          name="cancellationReason"
                          placeholder="Reason for cancellation..."
                          required
                          className="h-7 text-xs w-56"
                        />
                        <Button
                          type="submit"
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          Confirm Cancel
                        </Button>
                      </form>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
