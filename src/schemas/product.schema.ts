import { z } from "zod";
import { FULFILLMENT_TYPES, PRODUCT_CONDITIONS } from "@/config/enums";

export const productSchema = z
  .object({
    name: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug invalide"),
    sku: z.string().min(1, "Le SKU est requis"),
    condition: z.enum(PRODUCT_CONDITIONS).default("NEUF"),
    description: z.string().optional(),
    brandId: z.string().uuid().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    subcategoryId: z.string().uuid().optional().nullable(),
    price: z.coerce.number().positive("Le prix réel doit être supérieur à 0"),
    compareAtPrice: z.coerce.number().positive().optional().nullable(),
    costPrice: z.coerce.number().nonnegative().optional().nullable(),
    stockQuantity: z.coerce.number().int().nonnegative().default(0),
    lowStockThreshold: z.coerce.number().int().nonnegative().default(5),
    fulfillmentType: z.enum(FULFILLMENT_TYPES).default("SENDUU_STOCK"),
    codAvailable: z.boolean().default(true),
    storePickupAvailable: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    imageUrl: z
      .string()
      .url("URL d'image invalide")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => data.compareAtPrice == null || data.compareAtPrice > data.price,
    {
      message: "Le prix réel (barré) doit être supérieur au prix promo.",
      path: ["compareAtPrice"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;
