import { z } from "zod";

export const createRfqSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  quantity: z.coerce.number().int("Quantity must be a whole number").positive("Quantity must be positive"),
  deliveryLocation: z.string().trim().min(2, "Delivery location is required").max(200),
  deadline: z.coerce.date().refine((date) => date > new Date(), {
    message: "Deadline must be in the future",
  }),
});

export const updateRfqSchema = createRfqSchema.partial().extend({
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export const supplierRfqSearchSchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
});

export type CreateRfqInput = z.infer<typeof createRfqSchema>;
export type UpdateRfqInput = z.infer<typeof updateRfqSchema>;
export type SupplierRfqSearchInput = z.infer<typeof supplierRfqSearchSchema>;
