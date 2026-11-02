import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <Button variant="ghost" size="sm" asChild className="h-8 px-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Home</span>
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: November 2026</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert text-sm space-y-4 leading-relaxed">
        <p>
          Welcome to RasoiSync. These Terms of Service (&quot;Terms&quot;) govern your use of the
          RasoiSync catering storefront platform and management tools.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">1. Storefront & Quotations</h3>
        <p>
          RasoiSync provides software tools allowing catering businesses to publish menus,
          share storefront links on WhatsApp and social media, receive customer enquiries,
          and issue quotations.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">2. Enquiries and Bookings</h3>
        <p>
          Submission of an enquiry by a customer does not constitute a confirmed catering booking.
          Confirmed bookings require mutual agreement and formal confirmation by the caterer.
          Prices quoted on customer storefronts are subject to caterer verification.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">3. Accuracy of Menu Details</h3>
        <p>
          Catering businesses are solely responsible for the accuracy of their menus, dietary labels,
          food descriptions, hygiene practices, and allergen disclosures.
        </p>
      </div>
    </div>
  );
}
