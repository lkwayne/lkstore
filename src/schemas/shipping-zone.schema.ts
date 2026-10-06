import { z } from "zod";

export const shippingZoneSchema = z.object({
  city: z.string().trim().min(2, "Ville requise.").max(60),
  neighborhood: z.string().trim().min(2, "Quartier requis.").max(80),
  fee: z.number().min(0, "Le tarif ne peut pas être négatif.").max(100000, "Tarif trop élevé."),
  estimatedDays: z.number().int().min(1, "Délai minimum : 1 jour.").max(30),
  codAllowed: z.boolean(),
});

export const shippingZoneUpdateSchema = shippingZoneSchema
  .pick({ fee: true, estimatedDays: true, codAllowed: true })
  .extend({ isActive: z.boolean() });

export type ShippingZoneInput = z.input<typeof shippingZoneSchema>;
export type ShippingZoneUpdateInput = z.input<typeof shippingZoneUpdateSchema>;
