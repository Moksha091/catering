"use client";

import * as React from "react";
import Link from "next/link";
import { UtensilsCrossed, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span>RasoiSync</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="/c/annapurna-caterers"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Demo Storefront
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start Free</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3">
          <Link
            href="#features"
            className="block text-sm font-medium text-foreground py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="block text-sm font-medium text-foreground py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            How it Works
          </Link>
          <Link
            href="/c/annapurna-caterers"
            className="block text-sm font-medium text-foreground py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Demo Storefront
          </Link>
          <div className="pt-2 border-t flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/sign-up">Create Storefront</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

