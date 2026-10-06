"use server";

import { checkoutSchema, type CheckoutInput } from "@/schemas/order.schema";
import { getShippingZones, getStores } from "@/services/shipping.service";
import { createOrder, type CreateOrderResult } from "@/services/order.service";
import { getCurrentUser } from "@/services/auth.service";
import { ensureCustomerAccount } from "@/services/customer-account.service";
import {
  isWhatsAppConfigured,
  sendWhatsAppAccessMessage,
} from "@/services/whatsapp-notification.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/config/site";
import { allowRequest, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
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

  // Anti-abus : 10 commandes par heure et par adresse IP, 5 par téléphone.
  const ip = await getClientIp();
  const [ipOk, phoneOk] = await Promise.all([
    allowRequest("order:ip", ip, 10, 60 * 60),
    allowRequest("order:phone", parsed.data.customerPhone, 5, 60 * 60),
  ]);
  if (!ipOk || !phoneOk) return { success: false, error: RATE_LIMIT_MESSAGE };

  let order: CreateOrderResult;
  try {
    order = await createOrder(parsed.data, items);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Une erreur est survenue lors de la création de votre commande.";
    return { success: false, error: message };
  }

  // Commande créée avec succès : on tente ensuite la création de compte
  // client et l'envoi des accès. Un échec ici ne doit jamais faire échouer
  // la commande elle-même, qui est déjà validée en base à ce stade.
  try {
    await createAccountAndSendAccess(parsed.data, order);
  } catch {
    // Volontairement silencieux côté client — la commande reste un succès.
    // Toute erreur ici serait de toute façon invisible pour l'acheteur et
    // ne doit pas polluer son écran de confirmation.
  }

  return { success: true, order };
}

async function createAccountAndSendAccess(
  input: CheckoutInput,
  order: CreateOrderResult
): Promise<void> {
  const currentUser = await getCurrentUser();
  if (currentUser) return; // déjà connecté — a déjà un compte

  const result = await ensureCustomerAccount({
    email: input.customerEmail,
    firstName: input.customerFirstName,
    lastName: input.customerLastName,
    phone: input.customerPhone,
  });

  if (result.userId && result.isNewAccount) {
    // Rattache la commande au compte fraîchement créé.
    // Même contournement de typage que order-admin.service.ts : l'inférence
    // de type de supabase-js échoue sur .update() pour cette table à
    // travers ce client — la sécurité réelle vient du client service_role
    // utilisé ici (bypass RLS), pas du typage TypeScript de cet appel.
    interface OrdersUpdateBuilder {
      update: (values: { customer_id: string }) => {
        eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
      };
    }
    const admin = createAdminClient();
    const ordersTable = admin.from("orders") as unknown as OrdersUpdateBuilder;
    await ordersTable.update({ customer_id: result.userId }).eq("id", order.orderId);
  }

  if (isWhatsAppConfigured()) {
    const siteUrl = getSiteUrl();
    await sendWhatsAppAccessMessage({
      phone: input.customerPhone,
      firstName: input.customerFirstName,
      loginUrl: `${siteUrl}/login`,
    });
  }
  // Si l'API WhatsApp n'est pas configurée, sendWhatsAppAccessMessage()
  // n'est même pas appelée — aucun envoi simulé, aucune fausse promesse.
}
