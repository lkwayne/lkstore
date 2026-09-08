import { z } from "zod";
import { SUPPLIER_STATUSES } from "@/config/enums";

export const supplierSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  companyName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  currency: z.string().min(1, "Devise requise").default("XAF"),
  averageLeadTimeDays: z.coerce.number().int().nonnegative().optional().nullable(),
  status: z.enum(SUPPLIER_STATUSES).default("PENDING"),
  internalNotes: z.string().optional(),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

export const supplierProductSchema = z.object({
  productId: z.string().uuid("Sélectionnez un produit"),
  supplierSku: z.string().optional(),
  supplierCost: z.coerce.number().nonnegative("Coût invalide"),
  supplierStock: z.coerce.number().int().nonnegative().default(0),
  shippingCost: z.coerce.number().nonnegative().default(0),
  estimatedDeliveryDays: z.coerce.number().int().nonnegative().optional().nullable(),
  priority: z.coerce.number().int().min(1, "Priorité minimum : 1").default(1),
  status: z.enum(SUPPLIER_STATUSES).default("ACTIVE"),
});
export type SupplierProductInput = z.infer<typeof supplierProductSchema>;
