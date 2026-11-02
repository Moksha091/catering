"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import { Store, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { createBusinessOnboardingAction } from "@/app/(dashboard)/dashboard/onboarding/actions";
import { slugify } from "@/lib/validation/business";
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

export default function BusinessOnboardingPage() {
  const [state, formAction, isPending] = useActionState(
    createBusinessOnboardingAction,
    null
  );

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  return (
    <div className="container max-w-2xl py-12">
      <Card className="shadow-md">
        <CardHeader className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Create Your Catering Profile</CardTitle>
          <CardDescription>
            Step 1 of 2: Set up your business presence and claim your unique public storefront address.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-6">
            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Annapurna Caterers & Events"
                required
                value={businessName}
                onChange={handleNameChange}
              />
              {state?.fieldErrors?.name && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Storefront Web Address *</Label>
              <div className="flex items-center rounded-md border border-input bg-muted/40 px-3 focus-within:ring-2 focus-within:ring-ring">
                <span className="text-xs sm:text-sm text-muted-foreground select-none">
                  rasoisync.in/c/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  className="w-full bg-transparent py-2 pl-1 pr-2 text-xs sm:text-sm outline-none font-mono"
                  placeholder="annapurna-caterers"
                  value={slug}
                  onChange={handleSlugChange}
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>This will be the permanent link you share with customers on WhatsApp.</span>
              </p>
              {state?.fieldErrors?.slug && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.slug[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                />
                {state?.fieldErrors?.phone && (
                  <p className="text-xs text-destructive">
                    {state.fieldErrors.phone[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappPhone">WhatsApp Number for Orders *</Label>
                <Input
                  id="whatsappPhone"
                  name="whatsappPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                />
                {state?.fieldErrors?.whatsappPhone && (
                  <p className="text-xs text-destructive">
                    {state.fieldErrors.whatsappPhone[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City / Base Location *</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Hyderabad / Bengaluru"
                  required
                />
                {state?.fieldErrors?.city && (
                  <p className="text-xs text-destructive">
                    {state.fieldErrors.city[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State / Region</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="e.g. Telangana"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Catering Service</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Briefly describe your specialties: e.g. Authentic South Indian banana leaf feasts, North Indian wedding buffets, corporate live counters..."
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-6">
            <span className="text-xs text-muted-foreground">
              You can adjust menus and photos after creating your profile.
            </span>
            <Button type="submit" disabled={isPending} className="flex items-center gap-2">
              <span>{isPending ? "Setting up..." : "Save & Continue"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
