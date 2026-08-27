import { z } from "zod";
import { PAYMENT_METHODS, RECEPTION_METHODS } from "@/config/enums";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z
    .string()
    .min(9, "Numéro de téléphone invalide")
    .regex(/^[0-9+ ]+$/, "Numéro de téléphone invalide"),
  city: z.string().min(2, "Ville requise"),
  neighborhood: z.string().optional(),
  addressLine: z.string().optional(),
  instructions: z.string().optional(),
});

export const checkoutSchema = z
  .object({
    customerFirstName: z.string().min(2),
    customerLastName: z.string().min(2),
    customerPhone: z.string().min(9),
    customerEmail: z.string().email().optional().or(z.literal("")),
    receptionMethod: z.enum(RECEPTION_METHODS),
    shippingAddress: shippingAddressSchema.optional(),
    storeId: z.string().uuid().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    couponCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.receptionMethod === "DELIVERY" && !data.shippingAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Une adresse de livraison est requise pour ce mode de réception.",
        path: ["shippingAddress"],
      });
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
