"use server";

import { checkoutSchema, type CheckoutInput } from "@/schemas/order.schema";
import { getShippingZones, getStores } from "@/services/shipping.service";
import { createOrder, type CreateOrderResult } from "@/services/order.service";
import type { CartLine } from "@/types/cart";
import type { ShippingZone, Store } from "@/types/shipping";

export async function getCheckoutOptions(): Promise<{
  zones: ShippingZone[];
  stores: Store[];
}> {
  const [zones, stores] = await Promise.all([getShippingZones(), getStores()]);
  return { zones, stores };
}

export type PlaceOrderResult =
  | { success: true; order: CreateOrderResult }
  | { success: false; error: string };

export async function placeOrder(
  input: CheckoutInput,
  items: CartLine[]
): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Certaines informations du formulaire sont invalides.",
    };
  }

  if (items.length === 0) {
    return { success: false, error: "Votre panier est vide." };
  }

  try {
    const order = await createOrder(parsed.data, items);
    return { success: true, order };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Une erreur est survenue lors de la création de votre commande.";
    return { success: false, error: message };
  }
}
