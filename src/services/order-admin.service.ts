import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/config/enums";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  receptionMethod: string;
  total: number;
  createdAt: string;
  customerName: string | null;
  itemCount: number;
}

/**
 * Liste les commandes les plus récentes pour le back-office. Repose
 * entièrement sur la policy RLS `orders_owner_or_staff_select` : si
 * l'appelant n'est pas staff, Supabase ne renverra que ses propres
 * commandes (jamais toutes) — pas de vérification de rôle ici.
 */
export async function listOrdersForAdmin(limit = 50): Promise<OrderListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_method, payment_status, reception_method, total, created_at, shipping_address_id, order_items(id)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Impossible de charger les commandes : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    return {
      id: r.id as string,
      orderNumber: r.order_number as string,
      status: r.status as OrderStatus,
      paymentMethod: r.payment_method as string,
      paymentStatus: r.payment_status as string,
      receptionMethod: r.reception_method as string,
      total: Number(r.total),
      createdAt: r.created_at as string,
      customerName: null,
      itemCount: Array.isArray(r.order_items) ? r.order_items.length : 0,
    };
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const supabase = await createClient();

  // Même contournement que pour l'appel RPC dans order.service.ts :
  // l'inférence de type de supabase-js pour .update() échoue à travers
  // @supabase/ssr sur cette table ; on type explicitement et on s'appuie
  // sur la policy RLS `orders_staff_update` pour la sécurité réelle.
  interface OrdersUpdateBuilder {
    update: (values: { status: OrderStatus }) => {
      eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
    };
  }
  const ordersTable = supabase.from("orders") as unknown as OrdersUpdateBuilder;

  const { error } = await ordersTable.update({ status }).eq("id", orderId);

  if (error) {
    throw new Error(`Impossible de mettre à jour la commande : ${error.message}`);
  }
}
