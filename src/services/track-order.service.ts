import { createClient } from "@supabase/supabase-js";

export interface TrackedOrder {
  orderNumber: string;
  status: string;
  receptionMethod: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: { name: string; quantity: number }[];
}

export type TrackResult =
  | { found: true; order: TrackedOrder }
  | { found: false }
  | { error: string };

export async function trackOrder(orderNumber: string, phone: string): Promise<TrackResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const rpc = supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: Array<Record<string, unknown>> | null; error: { message: string } | null }>;

  const { data, error } = await rpc.call(supabase, "track_order", {
    p_order_number: orderNumber,
    p_phone: phone,
  });
  if (error) return { error: "Le suivi est momentanément indisponible. Réessayez plus tard." };
  const row = data?.[0];
  if (!row) return { found: false };

  return {
    found: true,
    order: {
      orderNumber: row.order_number as string,
      status: row.status as string,
      receptionMethod: row.reception_method as string,
      paymentMethod: row.payment_method as string,
      paymentStatus: row.payment_status as string,
      total: Number(row.total),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      items: (row.items as { name: string; quantity: number }[]) ?? [],
    },
  };
}
