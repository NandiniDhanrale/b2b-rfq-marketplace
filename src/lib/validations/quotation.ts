import { z } from "zod";

export const quotationSchema = z.object({
  price: z.coerce.number().positive("Price must be a positive number"),
  estimatedDelivery: z.string().trim().min(2, "Estimated delivery is required").max(200),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
