"use server";

import { getProductsByIds } from "@/services/catalog.service";
import type { CartProductData } from "@/types/cart";

export async function fetchCartProductData(
  productIds: string[]
): Promise<CartProductData[]> {
  const uniqueIds = Array.from(new Set(productIds));
  const products = await getProductsByIds(uniqueIds);

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stockQuantity: product.stockQuantity,
    primaryImageUrl: product.primaryImageUrl,
  }));
}
