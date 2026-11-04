"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UtensilsCrossed, AlertCircle, ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { signInAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SignInAlerts() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const notice = searchParams.get("notice");

  if (error === "auth_callback_failed") {
    return (
      <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>The authentication link was invalid or has expired. Please sign in below.</span>
      </div>
    );
  }

  if (notice === "check_email") {
    return (
      <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-primary/10 text-primary border border-primary/20">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Please confirm your email address before signing in.</span>
      </div>
    );
  }

  return null;
}

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>
            Sign in to manage your catering menu, enquiries, and bookings.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            <React.Suspense fallback={null}>
              <SignInAlerts />
            </React.Suspense>

            {state?.error && (
              <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="caterer@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign In to Dashboard"}
              {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have a catering storefront yet?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-medium hover:underline"
              >
                Start Free
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

