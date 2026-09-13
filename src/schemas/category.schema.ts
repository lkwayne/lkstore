import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  slug: z
    .string()
    .min(2, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const subcategorySchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  slug: z
    .string()
    .min(2, "Le slug est requis")
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres, tirets uniquement)"),
  description: z.string().optional(),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
});
export type SubcategoryInput = z.infer<typeof subcategorySchema>;
