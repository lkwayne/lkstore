import Image from "next/image";
import Link from "next/link";
import { listProductsForAdmin } from "@/services/admin-catalog.service";
import { StockAndStatusEditor } from "@/components/admin/StockAndStatusEditor";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Produits</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-gradient rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Aucun produit pour le moment.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Stock / Statut</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-surface">
                        {product.primaryImageUrl ? (
                          <Image
                            src={product.primaryImageUrl}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy">{product.name}</p>
                        <p className="text-xs text-neutral-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {product.categoryName ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-navy">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StockAndStatusEditor
                      productId={product.id}
                      stockQuantity={product.stockQuantity}
                      status={product.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs font-semibold text-brand-orange hover:underline"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
