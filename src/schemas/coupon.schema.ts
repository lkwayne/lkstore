import { z } from "zod";

/** Code promo : lettres, chiffres, tiret — stocké en majuscules. */
export const couponCodeSchema = z
  .string()
  .trim()
  .min(3, "Le code doit faire au moins 3 caractères.")
  .max(30, "Le code est trop long.")
  .regex(/^[A-Za-z0-9-]+$/, "Lettres, chiffres et tirets uniquement.")
  .transform((v) => v.toUpperCase());

export const couponInputSchema = z
  .object({
    code: couponCodeSchema,
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive("La valeur doit être supérieure à 0."),
    minOrderAmount: z.number().min(0).default(0),
    maxDiscount: z.number().positive().nullable().default(null),
    usageLimit: z.number().int().positive().nullable().default(null),
    endsAt: z.string().nullable().default(null),
  })
  .superRefine((d, ctx) => {
    if (d.discountType === "PERCENTAGE" && d.discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Un pourcentage ne peut pas dépasser 100.",
        path: ["discountValue"],
      });
    }
  });

export type CouponInput = z.input<typeof couponInputSchema>;
