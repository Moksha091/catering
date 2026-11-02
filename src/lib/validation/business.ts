import { z } from "zod";

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "booking",
  "bookings",
  "c",
  "dashboard",
  "enquiry",
  "enquiries",
  "login",
  "logout",
  "menu",
  "menus",
  "package",
  "packages",
  "privacy",
  "quote",
  "quotes",
  "register",
  "settings",
  "signin",
  "sign-in",
  "signup",
  "sign-up",
  "terms",
  "wa",
] as const;

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]))
    return false;
  return true;
}

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .refine(
      (slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]),
      "This web address is reserved. Please choose another one."
    ),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits"),
  whatsappPhone: z
    .string()
    .trim()
    .min(10, "WhatsApp number must be at least 10 digits")
    .max(15, "WhatsApp number cannot exceed 15 digits"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().optional().or(z.literal("")),
  addressText: z.string().trim().max(255).optional().or(z.literal("")),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

