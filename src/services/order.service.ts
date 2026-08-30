import { createClient } from "@/lib/supabase/server";
import type { CheckoutInput } from "@/schemas/order.schema";
import type { CartLine } from "@/types/cart";

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
}

/**
 * Traduit le formulaire checkout + le panier en payload attendu par la
 * fonction SQL `create_order(payload jsonb)`. Fonction pure — pas d'accès
 * réseau — pour rester facilement testable.
 */
export function buildCreateOrderPayload(
  input: CheckoutInput,
  items: CartLine[]
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    items: items.map((line) => ({
      product_id: line.productId,
      quantity: line.quantity,
    })),
    reception_method: input.receptionMethod,
    payment_method: input.paymentMethod,
    customer_first_name: input.customerFirstName,
    customer_last_name: input.customerLastName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail || null,
  };

  if (input.receptionMethod === "DELIVERY") {
    payload.shipping_zone_id = input.shippingZoneId;
    payload.address_line = input.addressLine;
    payload.instructions = input.instructions || null;
  } else {
    payload.store_id = input.storeId;
  }

  return payload;
}

export async function createOrder(
  input: CheckoutInput,
  items: CartLine[]
): Promise<CreateOrderResult> {
  const payload = buildCreateOrderPayload(input, items);
  const supabase = await createClient();

  // L'inférence de type de supabase-js pour .rpc() échoue à résoudre notre
  // Database custom à travers @supabase/ssr (profondeur d'instanciation
  // générique) ; on type explicitement l'appel et on revalide la forme de
  // la réponse au runtime ci-dessous plutôt que de faire confiance au seul
  // typage statique.
  type CreateOrderRpc = (
    fn: "create_order",
    args: { payload: Record<string, unknown> }
  ) => Promise<{
    data: { order_id: string; order_number: string; total: number }[] | null;
    error: { message: string } | null;
  }>;
  const rpc = supabase.rpc.bind(supabase) as unknown as CreateOrderRpc;

  const { data, error } = await rpc("create_order", { payload });

  if (error) {
    // Les messages de create_order() sont déjà rédigés pour l'utilisateur
    // final (voir supabase/migrations/0002_checkout.sql) — on les relaie
    // tels quels plutôt que d'exposer une erreur technique.
    throw new Error(error.message);
  }

  const row = data?.[0];
  if (!row || !row.order_id || !row.order_number) {
    throw new Error("La commande n'a pas pu être créée. Réessayez.");
  }

  return {
    orderId: row.order_id,
    orderNumber: row.order_number,
    total: Number(row.total),
  };
}
