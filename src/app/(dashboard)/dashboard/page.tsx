import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Share2,
  ExternalLink,
  MessageCircle,
  Inbox,
  CalendarCheck,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BusinessService } from "@/server/services/business.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();

  if (businesses.length === 0) {
    redirect("/dashboard/onboarding");
  }

  const business = businesses[0];
  const storefrontUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/c/${business.slug}`;

  // WhatsApp share link generator
  const waShareText = encodeURIComponent(
    `Hello! Check out our catering menu, specialty packages, and event pricing here: ${storefrontUrl}`
  );
  const waShareLink = `https://wa.me/?text=${waShareText}`;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Welcome & Storefront Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {business.name}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                business.published
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {business.published ? "Live & Published" : "Draft (Hidden)"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {business.city ? `${business.city} • ` : ""}
            WhatsApp: {business.whatsapp_phone || "Not set"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/c/${business.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview Storefront
            </Link>
          </Button>

          <Button variant="whatsapp" size="sm" asChild>
            <Link href={waShareLink} target="_blank" rel="noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Share on WhatsApp
            </Link>
          </Button>
        </div>
      </div>

      {/* Share Link Highlight Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <Share2 className="h-4 w-4 text-primary" />
              <span>Your Public Storefront Address</span>
            </h4>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground break-all">
              {storefrontUrl}
            </p>
          </div>
          <Button
            size="sm"
            asChild
            className="shrink-0"
          >
            <Link href={`/c/${business.slug}`} target="_blank">
              Open Link
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Enquiries
            </CardTitle>
            <Inbox className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              From website & WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Quotes
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting customer acceptance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Bookings
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed event bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps for New Caterers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Storefront Setup Progress</span>
          </CardTitle>
          <CardDescription>
            Complete these quick steps to start sharing your menu with clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Business Profile Created</p>
                <p className="text-xs text-muted-foreground">
                  Slug: {business.slug}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                2
              </div>
              <div>
                <p className="font-semibold text-sm">Add Your Menus & Dishes</p>
                <p className="text-xs text-muted-foreground">
                  Organize items with pricing (per-plate or fixed) and dietary tags.
                </p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href="/dashboard/menus">Manage Menus</Link>
            </Button>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                3
              </div>
              <div>
                <p className="font-semibold text-sm">Create Catering Packages</p>
                <p className="text-xs text-muted-foreground">
                  Offer bundle packages (e.g. Wedding Deluxe, Hi-Tea, Corporate Lunch).
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/packages">Create Package</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
