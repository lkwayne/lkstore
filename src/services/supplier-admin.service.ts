import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { SupplierInput, SupplierProductInput } from "@/schemas/supplier.schema";

type SupplierRow = Database["public"]["Tables"]["suppliers"]["Row"];

export interface SupplierListItem {
  id: string;
  name: string;
  companyName: string | null;
  country: string | null;
  status: SupplierRow["status"];
  productCount: number;
}

export interface SupplierDetail extends SupplierInput {
  id: string;
}

export interface LinkedProduct {
  id: string;
  productId: string;
  productName: string;
  supplierCost: number;
  supplierStock: number;
  shippingCost: number;
  priority: number;
  status: SupplierRow["status"];
}

export interface FulfillmentOrderItem {
  id: string;
  reference: string;
  orderId: string;
  orderNumber: string;
  supplierName: string | null;
  productName: string;
  quantity: number;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
}

/**
 * Toutes les écritures ci-dessous s'appuient sur les policies RLS
 * `suppliers_staff_only` / `supplier_products_staff_only` /
 * `fulfillment_orders_staff_only` — jamais exposées au client final, aucune
 * vérification de rôle explicite n'est donc faite ici.
 */
export async function listSuppliers(): Promise<SupplierListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, company_name, country, status, supplier_products(id)")
    .order("name");

  if (error) {
    throw new Error(`Impossible de charger les fournisseurs : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    return {
      id: r.id as string,
      name: r.name as string,
      companyName: r.company_name as string | null,
      country: r.country as string | null,
      status: r.status as SupplierRow["status"],
      productCount: Array.isArray(r.supplier_products) ? r.supplier_products.length : 0,
    };
  });
}

export async function getSupplierForEdit(id: string): Promise<SupplierDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle()
    .returns<SupplierRow>();

  if (error) {
    throw new Error(`Impossible de charger le fournisseur : ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    companyName: data.company_name ?? "",
    country: data.country ?? "",
    city: data.city ?? "",
    phone: data.phone ?? "",
    whatsapp: data.whatsapp ?? "",
    email: data.email ?? "",
    website: data.website ?? "",
    currency: data.currency,
    averageLeadTimeDays: data.average_lead_time_days,
    status: data.status,
    internalNotes: data.internal_notes ?? "",
  };
}

export async function getLinkedProducts(supplierId: string): Promise<LinkedProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supplier_products")
    .select("id, product_id, supplier_cost, supplier_stock, shipping_cost, priority, status, product:products(name)")
    .eq("supplier_id", supplierId)
    .order("priority");

  if (error) {
    throw new Error(`Impossible de charger les produits liés : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const product = r.product as { name: string } | null;
    return {
      id: r.id as string,
      productId: r.product_id as string,
      productName: product?.name ?? "Produit supprimé",
      supplierCost: Number(r.supplier_cost),
      supplierStock: r.supplier_stock as number,
      shippingCost: Number(r.shipping_cost),
      priority: r.priority as number,
      status: r.status as SupplierRow["status"],
    };
  });
}

function toSupplierRow(input: SupplierInput) {
  return {
    name: input.name,
    company_name: input.companyName || null,
    country: input.country || null,
    city: input.city || null,
    phone: input.phone || null,
    whatsapp: input.whatsapp || null,
    email: input.email || null,
    website: input.website || null,
    currency: input.currency,
    average_lead_time_days: input.averageLeadTimeDays ?? null,
    status: input.status,
    internal_notes: input.internalNotes || null,
  };
}

/**
 * Contourne le même problème d'inférence de type profonde que pour les
 * autres écritures via @supabase/ssr (voir order.service.ts,
 * order-admin.service.ts, admin-catalog.service.ts) — la sécurité réelle
 * vient des policies RLS, pas du typage TypeScript de ces appels.
 */
interface WriteBuilder {
  insert: (values: Record<string, unknown>) => {
    select: (columns: "id") => {
      single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    };
  };
  update: (values: Record<string, unknown>) => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
  delete: () => {
    eq: (column: "id", value: string) => Promise<{ error: { message: string } | null }>;
  };
}

export async function createSupplier(input: SupplierInput): Promise<string> {
  const supabase = await createClient();
  const table = supabase.from("suppliers") as unknown as WriteBuilder;
  const { data, error } = await table.insert(toSupplierRow(input)).select("id").single();
  if (error) {
    throw new Error(`Impossible de créer le fournisseur : ${error.message}`);
  }
  return data!.id;
}

export async function updateSupplier(id: string, input: SupplierInput): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("suppliers") as unknown as WriteBuilder;
  const { error } = await table.update(toSupplierRow(input)).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour le fournisseur : ${error.message}`);
  }
}

export async function addSupplierProduct(
  supplierId: string,
  input: SupplierProductInput
): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("supplier_products") as unknown as WriteBuilder;
  const { error } = await table
    .insert({
      supplier_id: supplierId,
      product_id: input.productId,
      supplier_sku: input.supplierSku || null,
      supplier_cost: input.supplierCost,
      supplier_stock: input.supplierStock,
      shipping_cost: input.shippingCost,
      estimated_delivery_days: input.estimatedDeliveryDays ?? null,
      priority: input.priority,
      status: input.status,
    })
    .select("id")
    .single();
  if (error) {
    throw new Error(`Impossible de lier ce produit : ${error.message}`);
  }
}

export async function removeSupplierProduct(linkId: string): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("supplier_products") as unknown as WriteBuilder;
  const { error } = await table.delete().eq("id", linkId);
  if (error) {
    throw new Error(`Impossible de retirer ce produit : ${error.message}`);
  }
}

export async function listFulfillmentOrders(): Promise<FulfillmentOrderItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fulfillment_orders")
    .select(
      "id, reference, order_id, quantity, status, tracking_number, created_at, product:products(name), supplier:suppliers(name), order:orders(order_number)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les commandes fournisseur : ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as Record<string, unknown>;
    const product = r.product as { name: string } | null;
    const supplier = r.supplier as { name: string } | null;
    const order = r.order as { order_number: string } | null;
    return {
      id: r.id as string,
      reference: r.reference as string,
      orderId: r.order_id as string,
      orderNumber: order?.order_number ?? "—",
      supplierName: supplier?.name ?? null,
      productName: product?.name ?? "Produit supprimé",
      quantity: r.quantity as number,
      status: r.status as string,
      trackingNumber: r.tracking_number as string | null,
      createdAt: r.created_at as string,
    };
  });
}

export async function updateFulfillmentOrder(
  id: string,
  values: { status?: string; trackingNumber?: string }
): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("fulfillment_orders") as unknown as WriteBuilder;
  const payload: Record<string, unknown> = {};
  if (values.status) payload.status = values.status;
  if (values.trackingNumber !== undefined) payload.tracking_number = values.trackingNumber || null;

  const { error } = await table.update(payload).eq("id", id);
  if (error) {
    throw new Error(`Impossible de mettre à jour : ${error.message}`);
  }
}
