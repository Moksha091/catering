import Link from "next/link";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UtensilsCrossed className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">Page Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The catering storefront or page you are looking for does not exist or may have been unlisted.
        </p>
      </div>
      <Button asChild className="flex items-center gap-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </Button>
    </div>
  );
}
