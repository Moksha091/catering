import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto py-8 text-sm text-muted-foreground">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <UtensilsCrossed className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground">RasoiSync</span>
          <span>— WhatsApp-First Catering Storefront SaaS</span>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

