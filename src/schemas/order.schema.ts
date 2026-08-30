import { z } from "zod";
import { PAYMENT_METHODS, RECEPTION_METHODS } from "@/config/enums";

/**
 * Schéma de validation du checkout, aligné sur le contrat attendu par la
 * fonction SQL `create_order()` (supabase/migrations/0002_checkout.sql).
 * Le tarif de livraison n'est jamais saisi ici : on ne choisit qu'une zone
 * existante (shippingZoneId), le tarif réel est relu côté serveur.
 */
export const checkoutSchema = z
  .object({
    customerFirstName: z.string().min(2, "Prénom requis"),
    customerLastName: z.string().min(2, "Nom requis"),
    customerPhone: z
      .string()
      .min(9, "Numéro de téléphone invalide")
      .regex(/^[0-9+ ]+$/, "Numéro de téléphone invalide"),
    customerEmail: z.string().email("Email invalide").optional().or(z.literal("")),
    receptionMethod: z.enum(RECEPTION_METHODS),
    paymentMethod: z.enum(PAYMENT_METHODS),

    // Requis si receptionMethod === "DELIVERY"
    shippingZoneId: z.string().uuid().optional(),
    addressLine: z.string().min(3, "Adresse requise").optional().or(z.literal("")),
    instructions: z.string().optional(),

    // Requis si receptionMethod === "STORE_PICKUP"
    storeId: z.string().uuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.receptionMethod === "DELIVERY") {
      if (!data.shippingZoneId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sélectionnez votre zone de livraison.",
          path: ["shippingZoneId"],
        });
      }
      if (!data.addressLine) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Indiquez votre adresse précise (rue, repère...).",
          path: ["addressLine"],
        });
      }
    }
    if (data.receptionMethod === "STORE_PICKUP" && !data.storeId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Un magasin doit être sélectionné pour le retrait.",
        path: ["storeId"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
