import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { OrderStatus } from "@/config/enums";

type OrderStatsRow = Pick<Database["public"]["Tables"]["orders"]["Row"], "total" | "status">;
type OrderItemStatsRow = Pick<
  Database["public"]["Tables"]["order_items"]["Row"],
  "product_name_snapshot" | "quantity"
>;
type ProductStockRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "stock_quantity" | "low_stock_threshold"
>;

export interface DashboardStats {
  totalRevenue: number;
  orderCount: number;
  averageBasket: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
  lowStockCount: number;
  topProducts: { name: string; quantitySold: number }[];
}

const EXCLUDED_FROM_REVENUE: OrderStatus[] = ["CANCELLED", "RETURNED"];

/**
 * Agrégats calculés côté application à partir de requêtes simples — pas de
 * fonction SQL dédiée pour l'instant, le volume de commandes actuel ne le
 * justifie pas. À revoir (agrégation SQL) si le nombre de commandes devient
 * important, pour éviter de rapatrier toutes les lignes à chaque chargement.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const [ordersResult, itemsResult, productsResult] = await Promise.all([
    supabase.from("orders").select("total, status").returns<OrderStatsRow[]>(),
    supabase
      .from("order_items")
      .select("product_name_snapshot, quantity")
      .returns<OrderItemStatsRow[]>(),
    supabase
      .from("products")
      .select("stock_quantity, low_stock_threshold")
      .eq("status", "PUBLISHED")
      .returns<ProductStockRow[]>(),
  ]);

  if (ordersResult.error) {
    throw new Error(`Impossible de charger les commandes : ${ordersResult.error.message}`);
  }
  if (itemsResult.error) {
    throw new Error(`Impossible de charger les articles vendus : ${itemsResult.error.message}`);
  }
  if (productsResult.error) {
    throw new Error(`Impossible de charger les produits : ${productsResult.error.message}`);
  }

  const orders = ordersResult.data ?? [];
  const items = itemsResult.data ?? [];
  const products = productsResult.data ?? [];

  const revenueOrders = orders.filter(
    (o) => !EXCLUDED_FROM_REVENUE.includes(o.status as OrderStatus)
  );
  const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const averageBasket = revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0;

  const ordersByStatus: Partial<Record<OrderStatus, number>> = {};
  for (const order of orders) {
    const status = order.status as OrderStatus;
    ordersByStatus[status] = (ordersByStatus[status] ?? 0) + 1;
  }

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= p.low_stock_threshold
  ).length;

  const salesByProduct = new Map<string, number>();
  for (const item of items) {
    salesByProduct.set(
      item.product_name_snapshot,
      (salesByProduct.get(item.product_name_snapshot) ?? 0) + item.quantity
    );
  }
  const topProducts = Array.from(salesByProduct.entries())
    .map(([name, quantitySold]) => ({ name, quantitySold }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  return {
    totalRevenue,
    orderCount,
    averageBasket,
    ordersByStatus,
    lowStockCount,
    topProducts,
  };
}
