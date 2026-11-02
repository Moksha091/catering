import { z } from "zod";

export const PACKAGE_PRICING_TYPES = [
  "fixed",
  "per_person",
  "starting_from",
  "quote_required",
] as const;

export const createPackageSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Package name must be at least 2 characters")
      .max(100, "Package name cannot exceed 100 characters"),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
    pricingType: z.enum(PACKAGE_PRICING_TYPES).default("per_person"),
    priceRupees: z.coerce.number().nonnegative().optional(),
    minimumGuests: z.coerce.number().int().positive().optional().nullable(),
    maximumGuests: z.coerce.number().int().positive().optional().nullable(),
    isPublished: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.pricingType !== "quote_required") {
        return (
          data.priceRupees !== undefined &&
          data.priceRupees !== null &&
          data.priceRupees >= 0
        );
      }
      return true;
    },
    {
      message: "Price is required unless pricing is set to 'quote required'",
      path: ["priceRupees"],
    }
  )
  .refine(
    (data) => {
      if (
        data.minimumGuests &&
        data.maximumGuests &&
        data.maximumGuests < data.minimumGuests
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Maximum guests cannot be less than minimum guests",
      path: ["maximumGuests"],
    }
  );

export const addPackageItemSchema = z.object({
  packageId: z.string().uuid("Valid package ID is required"),
  menuItemId: z.string().uuid().optional().nullable(),
  itemNameSnapshot: z
    .string()
    .trim()
    .min(1, "Item description or name is required"),
  quantityOrDescription: z.string().trim().max(255).optional().or(z.literal("")),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type AddPackageItemInput = z.infer<typeof addPackageItemSchema>;
