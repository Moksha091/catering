import { z } from "zod";

export const DIETARY_TYPES = [
  "veg",
  "non_veg",
  "vegan",
  "egg",
  "other",
  "unspecified",
] as const;

export const PRICE_TYPES = [
  "fixed",
  "per_person",
  "market_rate",
  "quote_required",
  "hidden",
] as const;

export const createMenuSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Menu name must be at least 2 characters")
    .max(100, "Menu name cannot exceed 100 characters"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  menuType: z.string().trim().max(50).optional().or(z.literal("")),
});

export const createCategorySchema = z.object({
  menuId: z.string().uuid("Valid menu ID is required"),
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z.string().trim().max(255).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0).optional(),
});

export const createMenuItemSchema = z
  .object({
    categoryId: z.string().uuid("Valid category ID is required"),
    name: z
      .string()
      .trim()
      .min(2, "Item name must be at least 2 characters")
      .max(100, "Item name cannot exceed 100 characters"),
    description: z.string().trim().max(500).optional().or(z.literal("")),
    dietaryType: z.enum(DIETARY_TYPES).default("veg").optional(),
    priceType: z.enum(PRICE_TYPES).default("fixed").optional(),
    priceRupees: z.coerce.number().nonnegative().optional(),
    unitLabel: z.string().trim().max(50).optional().or(z.literal("")),
    isAvailable: z.boolean().default(true).optional(),
  })
  .refine(
    (data) => {
      // If priceType is fixed or per_person, priceRupees should preferably be provided
      if (data.priceType && ["fixed", "per_person"].includes(data.priceType)) {
        return (
          data.priceRupees !== undefined &&
          data.priceRupees !== null &&
          data.priceRupees >= 0
        );
      }
      return true;
    },
    {
      message: "Price is required for fixed or per-person items",
      path: ["priceRupees"],
    }
  );

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
