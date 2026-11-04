"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
} from "lucide-react";
import { submitPublicEnquiryAction, PublicEnquiryState } from "@/app/c/[slug]/actions";
import { Package } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PublicEnquiryForm({
  slug,
  packages,
}: {
  slug: string;
  packages: Package[];
}) {
  const boundAction = submitPublicEnquiryAction.bind(null, slug);
  const [state, formAction, isPending] = useActionState<PublicEnquiryState | null, FormData>(
    boundAction,
    null
  );

  // Success State
  if (state?.result) {
    const { referenceNumber, businessName, whatsappPhone } = state.result;

    const waText = encodeURIComponent(
      `Hi ${businessName}, I submitted an event enquiry on your catering storefront (Ref: ${referenceNumber}). I'd like to discuss the menu details!`
    );
    const waLink = whatsappPhone
      ? `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${waText}`
      : `https://wa.me/?text=${waText}`;

    return (
      <Card className="border-emerald-500/30 bg-emerald-50/50 shadow-md">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 mb-2">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-emerald-900">
            Enquiry Received!
          </CardTitle>
          <CardDescription className="text-emerald-700">
            Your reference number is{" "}
            <span className="font-mono font-bold">{referenceNumber}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-foreground/80 max-w-md mx-auto">
            {businessName} has received your requirements and will review date
            availability. For fastest confirmation, you can message them directly on
            WhatsApp now.
          </p>

          <Button variant="whatsapp" size="lg" asChild className="w-full sm:w-auto shadow-md">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              <span>Continue on WhatsApp ({referenceNumber})</span>
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="enquire" className="shadow-md border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl">Request a Quote / Booking</CardTitle>
        <CardDescription>
          Tell us about your event. We will check availability and prepare an
          itemized quote.
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Your Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Ramesh Patel"
                required
              />
              {state?.fieldErrors?.customerName && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.customerName[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Phone / WhatsApp Number *</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="+91 98765 43210"
                required
              />
              {state?.fieldErrors?.customerPhone && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.customerPhone[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventDate" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Event Date</span>
              </Label>
              <Input id="eventDate" name="eventDate" type="date" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guestCount" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Guest Count</span>
              </Label>
              <Input
                id="guestCount"
                name="guestCount"
                type="number"
                min="10"
                placeholder="e.g. 150"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eventType">Event Type</Label>
              <select
                id="eventType"
                name="eventType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="Wedding"
              >
                <option value="Wedding">Wedding</option>
                <option value="Reception">Reception</option>
                <option value="Birthday">Birthday / Anniversary</option>
                <option value="Corporate">Corporate Lunch / Meeting</option>
                <option value="Housewarming">Housewarming / Puja</option>
                <option value="Other">Other Event</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="selectedPackageId">Interested Package (Optional)</Label>
              <select
                id="selectedPackageId"
                name="selectedPackageId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">Custom Menu (No package selected)</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">Venue Locality / City</Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g. Jubilee Hills, Hyderabad"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customerNotes">Special Requests / Preferences</Label>
            <Textarea
              id="customerNotes"
              name="customerNotes"
              placeholder="e.g. Vegetarian only, need live dosa counter, start time around 7 PM..."
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            By submitting, you agree to receive a quotation and WhatsApp message
            regarding this catering enquiry.
          </p>

          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Enquiry
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

