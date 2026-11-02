import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <Button variant="ghost" size="sm" asChild className="h-8 px-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Home</span>
        </Link>
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: November 2026</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert text-sm space-y-4 leading-relaxed">
        <p>
          RasoiSync values your privacy and is committed to protecting the personal information
          of our caterers and event clients.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">1. Information We Collect</h3>
        <p>
          We collect business information (name, business address, phone number, WhatsApp contact)
          from caterers, and contact details (name, phone number, event details) submitted
          by clients through catering enquiry forms.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">2. Purpose of Collection</h3>
        <p>
          Customer contact details are collected strictly to enable the caterer to respond to
          enquiries, provide accurate quotations, and coordinate event catering services. We do
          not sell personal data to third parties.
        </p>

        <h3 className="font-bold text-base text-foreground mt-4">3. Data Security</h3>
        <p>
          All data is protected using PostgreSQL Row Level Security (RLS) ensuring strict multi-tenant
          isolation between different catering businesses.
        </p>
      </div>
    </div>
  );
}
