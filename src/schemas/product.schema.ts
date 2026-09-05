import { z } from "zod";
import { FULFILLMENT_TYPES } from "@/config/enums";

export const productSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  sku: z.string().min(1, "Le SKU est requis"),
  description: z.string().optional(),
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  subcategoryId: z.string().uuid().optional().nullable(),
  price: z.coerce.number().nonnegative("Le prix ne peut pas être négatif"),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  costPrice: z.coerce.number().nonnegative().optional().nullable(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  lowStockThreshold: z.coerce.number().int().nonnegative().default(5),
  fulfillmentType: z.enum(FULFILLMENT_TYPES).default("SENDUU_STOCK"),
  codAvailable: z.boolean().default(true),
  storePickupAvailable: z.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
