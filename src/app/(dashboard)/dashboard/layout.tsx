import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  Package,
  Inbox,
  FileText,
  CalendarCheck,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BusinessService } from "@/server/services/business.service";
import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const businessService = new BusinessService(supabase);
  const businesses = await businessService.getUserBusinesses();

  // If user has no business and isn't on onboarding, allow onboarding child to render
  const primaryBusiness = businesses[0];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Sidebar for desktop */}
      <aside className="w-full md:w-64 border-r bg-card shrink-0 p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="px-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {primaryBusiness ? primaryBusiness.name : "Catering Workspace"}
            </h2>
            {primaryBusiness && (
              <p className="text-xs text-muted-foreground truncate">
                slug: {primaryBusiness.slug}
              </p>
            )}
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Overview</span>
            </Link>

            <Link
              href="/dashboard/menus"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Utensils className="h-4 w-4" />
              <span>Menus & Dishes</span>
            </Link>

            <Link
              href="/dashboard/packages"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Package className="h-4 w-4" />
              <span>Packages</span>
            </Link>

            <Link
              href="/dashboard/enquiries"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Inbox className="h-4 w-4" />
              <span>Enquiries</span>
            </Link>

            <Link
              href="/dashboard/quotes"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Quotes</span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Bookings</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t space-y-3">
          {primaryBusiness && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full justify-start gap-2 text-xs"
            >
              <Link
                href={`/c/${primaryBusiness.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                <span>View Storefront</span>
              </Link>
            </Button>
          )}

          <form action={signOutAction} className="w-full">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
