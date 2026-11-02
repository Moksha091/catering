import { z } from "zod";
import { rupeesToPaise } from "@/lib/utils";

export const quoteLineItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Item description is required")
    .max(255),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.string().trim().max(50).optional().or(z.literal("")),
  unitPriceRupees: z.coerce
    .number()
    .nonnegative("Unit price must be non-negative"),
});

export const createQuoteSchema = z.object({
  validUntil: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  discountRupees: z.coerce.number().nonnegative().default(0).optional(),
  taxRupees: z.coerce.number().nonnegative().default(0).optional(),
  additionalChargesRupees: z.coerce.number().nonnegative().default(0).optional(),
  depositRupees: z.coerce.number().nonnegative().default(0).optional(),
  items: z.array(quoteLineItemSchema).min(1, "At least one quote item is required"),
});

export interface CalculatedQuoteTotals {
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  additionalChargesPaise: number;
  totalPaise: number;
  depositPaise: number;
  items: Array<{
    description: string;
    quantity: number;
    unit: string | null;
    unitPricePaise: number;
    lineTotalPaise: number;
  }>;
}

/**
 * Authoritative financial calculation helper in integer paise
 */
export function calculateAuthoritativeQuoteTotals(
  input: z.infer<typeof createQuoteSchema>
): CalculatedQuoteTotals {
  let subtotalPaise = 0;

  const calculatedItems = input.items.map((item) => {
    const unitPricePaise = rupeesToPaise(item.unitPriceRupees);
    // Multiply quantity by paise, rounding cleanly
    const lineTotalPaise = Math.round(item.quantity * unitPricePaise);
    subtotalPaise += lineTotalPaise;

    return {
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || null,
      unitPricePaise,
      lineTotalPaise,
    };
  });

  const discountPaise = rupeesToPaise(input.discountRupees || 0);
  const taxPaise = rupeesToPaise(input.taxRupees || 0);
  const additionalChargesPaise = rupeesToPaise(input.additionalChargesRupees || 0);
  const depositPaise = rupeesToPaise(input.depositRupees || 0);

  const totalPaise = Math.max(
    0,
    subtotalPaise - discountPaise + taxPaise + additionalChargesPaise
  );

  return {
    subtotalPaise,
    discountPaise,
    taxPaise,
    additionalChargesPaise,
    totalPaise,
    depositPaise: Math.min(depositPaise, totalPaise),
    items: calculatedItems,
  };
}

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
