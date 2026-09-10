import { z } from "zod";
import { FULFILLMENT_TYPES, PRODUCT_CONDITIONS } from "@/config/enums";
import type { ProductInput } from "@/schemas/product.schema";

/**
 * Vocabulaire du formulaire admin : "Prix réel" (toujours affiché, barré si
 * une promo est active) et "Prix promo" (optionnel — s'il est renseigné,
 * c'est lui qui est facturé). En base, `products.price` reste toujours le
 * montant réellement facturé et `products.compare_at_price` la référence
 * barrée — voir toProductInput()/fromProductInput() pour la conversion.
 */
export const productFormSchema = z
  .object({
    name: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug invalide"),
    sku: z.string().min(1, "Le SKU est requis"),
    condition: z.enum(PRODUCT_CONDITIONS).default("NEUF"),
    description: z.string().optional(),
    brandId: z.string().uuid().optional().nullable(),
    categoryId: z.string().uuid().optional().nullable(),
    subcategoryId: z.string().uuid().optional().nullable(),
    realPrice: z.coerce.number().positive("Le prix réel doit être supérieur à 0"),
    promoPrice: z.coerce.number().positive().optional().nullable(),
    costPrice: z.coerce.number().nonnegative().optional().nullable(),
    stockQuantity: z.coerce.number().int().nonnegative().default(0),
    lowStockThreshold: z.coerce.number().int().nonnegative().default(5),
    fulfillmentType: z.enum(FULFILLMENT_TYPES).default("SENDUU_STOCK"),
    codAvailable: z.boolean().default(true),
    storePickupAvailable: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
  })
  .refine((data) => !data.promoPrice || data.promoPrice < data.realPrice, {
    message: "Le prix promo doit être inférieur au prix réel.",
    path: ["promoPrice"],
  });

export type ProductFormInput = z.infer<typeof productFormSchema>;

/**
 * Formulaire → modèle de données. Si un prix promo est renseigné, c'est lui
 * qui est facturé (`price`) et le prix réel devient la référence barrée
 * (`compareAtPrice`). Sinon, le prix réel est directement le prix facturé.
 */
export function toProductInput(form: ProductFormInput): ProductInput {
  const hasPromo = form.promoPrice != null && form.promoPrice > 0;

  return {
    name: form.name,
    slug: form.slug,
    sku: form.sku,
    condition: form.condition,
    description: form.description,
    brandId: form.brandId,
    categoryId: form.categoryId,
    subcategoryId: form.subcategoryId,
    price: hasPromo ? form.promoPrice! : form.realPrice,
    compareAtPrice: hasPromo ? form.realPrice : null,
    costPrice: form.costPrice,
    stockQuantity: form.stockQuantity,
    lowStockThreshold: form.lowStockThreshold,
    fulfillmentType: form.fulfillmentType,
    codAvailable: form.codAvailable,
    storePickupAvailable: form.storePickupAvailable,
    status: form.status,
    imageUrl: form.imageUrl,
  };
}

/**
 * Modèle de données → formulaire (pré-remplissage à l'édition). Inverse de
 * toProductInput() : si un compareAtPrice existe, c'est le prix réel et
 * `price` est alors le prix promo actif.
 */
export function fromProductInput(
  product: ProductInput
): Omit<ProductFormInput, "promoPrice"> & { promoPrice?: number | null } {
  const hasPromo = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    condition: product.condition,
    description: product.description,
    brandId: product.brandId,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    realPrice: hasPromo ? product.compareAtPrice! : product.price,
    promoPrice: hasPromo ? product.price : null,
    costPrice: product.costPrice,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    fulfillmentType: product.fulfillmentType,
    codAvailable: product.codAvailable,
    storePickupAvailable: product.storePickupAvailable,
    status: product.status,
    imageUrl: product.imageUrl,
  };
}
