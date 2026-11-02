"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function signInAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = signInSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid credentials",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password || "",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const validation = signUpSchema.safeParse({
    fullName,
    email,
    phone,
    password,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: {
        full_name: validation.data.fullName,
        phone: validation.data.phone || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard/onboarding");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

