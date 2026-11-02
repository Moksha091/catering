import Link from "next/link";
import {
  UtensilsCrossed,
  Share2,
  CalendarCheck,
  CheckCircle,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-12 md:py-20">
      {/* Hero Section */}
      <section className="container flex flex-col items-center text-center max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs md:text-sm font-semibold text-primary">
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp-Ready Digital Storefront for Indian Caterers</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Your catering business, menu, and bookings in{" "}
          <span className="text-primary underline decoration-primary/30 decoration-wavy">
            one shareable link
          </span>
          .
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Stop answering the same menu questions over and over. Publish your
          curated dishes, per-person packages, and event pricing in 10 minutes.
          Share on WhatsApp, collect organized customer enquiries, and track
          every booking.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <Button size="lg" asChild className="w-full sm:w-auto shadow-md">
            <Link href="/sign-up" className="flex items-center gap-2">
              <span>Create Your Storefront</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/c/annapurna-caterers">View Live Demo</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 text-left w-full border-t border-border mt-8">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Instant WhatsApp Links</p>
              <p className="text-xs text-muted-foreground">
                Prefilled event enquiries
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Clear Per-Plate Pricing</p>
              <p className="text-xs text-muted-foreground">
                Eliminate price ambiguity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">No Customer Sign-up</p>
              <p className="text-xs text-muted-foreground">
                Frictionless browsing
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Versioned Quotes</p>
              <p className="text-xs text-muted-foreground">
                Lock estimates securely
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="container py-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Built for how caterers actually work
          </h2>
          <p className="text-muted-foreground">
            No complicated ERP software or messy spreadsheets. Just what you
            need to get orders and stay organized.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Digital Menus & Packages</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Showcase wedding feasts, corporate lunches, or vegetarian
              spreads. Mark dietary labels (veg, non-veg, jain) and toggle dish
              availability in seconds.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">WhatsApp & Mobile Storefront</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customers browse on any mobile browser without downloading apps.
              One tap takes them to your WhatsApp chat with event date, guest
              count, and package details ready.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg">Enquiries, Quotes & Bookings</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn messages into organized bookings. Create tamper-proof
              customer quote links, record agreed deposits, and avoid double
              booking dates.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container py-8 border-t">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            From sign-up to sharing in 3 easy steps
          </h2>
          <p className="text-muted-foreground">
            Get your business live today without technical headaches.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
              1
            </div>
            <h4 className="font-bold text-base">Add Your Dishes & Packages</h4>
            <p className="text-sm text-muted-foreground">
              Enter your specialties, per-plate packages, and service areas.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
              2
            </div>
            <h4 className="font-bold text-base">Share Your Unique Link</h4>
            <p className="text-sm text-muted-foreground">
              Put your storefront link in your WhatsApp bio, Instagram, and
              business card QR codes.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-lg">
              3
            </div>
            <h4 className="font-bold text-base">Confirm & Serve</h4>
            <p className="text-sm text-muted-foreground">
              Receive structured enquiries, send official quotes, and track
              payments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
