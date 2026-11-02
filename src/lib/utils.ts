import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer paise into Indian Rupee display (e.g. 150000 -> ₹1,500)
 */
export function formatPaiseToINR(paise: number | bigint): string {
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Convert rupee float/decimal input into integer paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
