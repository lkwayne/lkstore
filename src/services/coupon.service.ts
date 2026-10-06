import { createAdminClient } from "@/lib/supabase/admin";
import { couponInputSchema, type CouponInput } from "@/schemas/coupon.schema";

export interface CouponPreview {
  valid: boolean;
  discount: number;
  code: string;
  message: string | null;
}

export interface CouponRow {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  endsAt: string | null;
  createdAt: string;
}

// Le client supabase-js n'infère pas ces tables/RPC à travers notre Database
// custom : on type explicitement les appels (même approche que order.service).
type Err = { message: string } | null;
interface CouponsTable {
  select: (cols: string) => {
    order: (c: string, o: { ascending: boolean }) => Promise<{ data: Record<string, unknown>[] | null; error: Err }>;
  };
  insert: (v: Record<string, unknown>) => Promise<{ error: Err }>;
  update: (v: Record<string, unknown>) => { eq: (c: "id", v: string) => Promise<{ error: Err }> };
}
type RpcFn = (
  fn: "check_coupon",
  args: { p_code: string; p_subtotal: number }
) => Promise<{
  data: { coupon_id: string | null; discount: number; error_message: string | null }[] | null;
  error: Err;
}>;

/** Sous-total recalculé depuis les prix en base — jamais fourni par le navigateur. */
async function serverSubtotal(items: { productId: string; quantity: number }[]): Promise<number> {
  const ids = [...new Set(items.map((i) => i.productId))];
  if (ids.length === 0) return 0;
  const admin = createAdminClient();
  const query = admin.from("products").select("id, price") as unknown as {
    in: (c: string, v: string[]) => {
      eq: (c: string, v: string) => Promise<{ data: { id: string; price: number }[] | null }>;
    };
  };
  const { data } = await query.in("id", ids).eq("status", "PUBLISHED");
  const prices = new Map((data ?? []).map((p) => [p.id, Number(p.price)]));
  return items.reduce((sum, i) => sum + (prices.get(i.productId) ?? 0) * Math.max(0, i.quantity), 0);
}

export async function previewCoupon(
  code: string,
  items: { productId: string; quantity: number }[]
): Promise<CouponPreview> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { valid: false, discount: 0, code: "", message: "Saisissez un code promo." };

  const subtotal = await serverSubtotal(items);
  const admin = createAdminClient();
  const rpc = admin.rpc.bind(admin) as unknown as RpcFn;
  const { data, error } = await rpc("check_coupon", { p_code: clean, p_subtotal: subtotal });
  if (error || !data?.[0]) {
    return { valid: false, discount: 0, code: clean, message: "Code indisponible pour le moment." };
  }
  const row = data[0];
  if (row.error_message) return { valid: false, discount: 0, code: clean, message: row.error_message };
  return { valid: true, discount: Number(row.discount), code: clean, message: null };
}

function table(): CouponsTable {
  return createAdminClient().from("coupons") as unknown as CouponsTable;
}

export async function listCoupons(): Promise<CouponRow[]> {
  const { data, error } = await table()
    .select("id, code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, usage_count, is_active, ends_at, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Impossible de charger les codes promo : ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    code: r.code as string,
    discountType: r.discount_type as "PERCENTAGE" | "FIXED",
    discountValue: Number(r.discount_value),
    minOrderAmount: Number(r.min_order_amount ?? 0),
    maxDiscount: r.max_discount == null ? null : Number(r.max_discount),
    usageLimit: r.usage_limit == null ? null : Number(r.usage_limit),
    usageCount: Number(r.usage_count ?? 0),
    isActive: Boolean(r.is_active),
    endsAt: (r.ends_at as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

export async function createCoupon(input: CouponInput): Promise<void> {
  const parsed = couponInputSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides.");
  const d = parsed.data;
  const { error } = await table().insert({
    code: d.code,
    discount_type: d.discountType,
    discount_value: d.discountValue,
    min_order_amount: d.minOrderAmount,
    max_discount: d.discountType === "PERCENTAGE" ? d.maxDiscount : null,
    usage_limit: d.usageLimit,
    ends_at: d.endsAt ? new Date(d.endsAt).toISOString() : null,
    is_active: true,
  });
  if (error) {
    if (error.message.includes("coupons_code_upper_key") || error.message.includes("duplicate")) {
      throw new Error("Ce code existe déjà.");
    }
    throw new Error("Impossible de créer le code promo.");
  }
}

export async function setCouponActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await table().update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error("Impossible de modifier le code promo.");
}
