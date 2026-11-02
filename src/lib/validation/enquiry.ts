import { z } from "zod";

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "quote_sent",
  "converted",
  "declined",
  "closed",
] as const;

export const publicEnquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  customerPhone: z
    .string()
    .trim()
    .min(10, "Phone number must have at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^[0-9+\-\s()]{10,15}$/, "Please enter a valid phone number"),
  customerEmail: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  eventType: z.string().trim().max(100).optional().or(z.literal("")),
  eventDate: z.string().trim().optional().or(z.literal("")),
  startTime: z.string().trim().optional().or(z.literal("")),
  guestCount: z.coerce.number().int().positive().optional().nullable(),
  venueAddress: z.string().trim().max(255).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  selectedPackageId: z.string().uuid().optional().nullable().or(z.literal("")),
  customerNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const updateEnquiryStatusSchema = z.object({
  enquiryId: z.string().uuid(),
  status: z.enum(ENQUIRY_STATUSES),
});

export const updateEnquiryNotesSchema = z.object({
  enquiryId: z.string().uuid(),
  internalNotes: z.string().max(2000).optional().or(z.literal("")),
  followUpAt: z.string().optional().nullable().or(z.literal("")),
});

export type PublicEnquiryInput = z.infer<typeof publicEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
export type UpdateEnquiryNotesInput = z.infer<typeof updateEnquiryNotesSchema>;
