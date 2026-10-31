import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(2, "SKU is required").max(64),
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  slug: z.string().max(260).optional(),
  description: z.string().optional(),
  category_id: z.string().uuid("Invalid category ID").nullable().optional(),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.unknown()).default({}),
  is_published: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;
