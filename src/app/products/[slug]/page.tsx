import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StockBadge } from "@/components/StockBadge";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/format-price";
import { getProductBySlug } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seoTitle ?? `${product.name} — SENDUU`,
    description: product.seoDescription ?? product.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <nav className="mb-6 text-sm text-neutral-400" aria-label="Fil d'ariane">
            <Link href="/categories" className="hover:text-brand-navy">
              Catégories
            </Link>
            {product.category ? (
              <>
                {" / "}
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-brand-navy"
                >
                  {product.category.name}
                </Link>
              </>
            ) : null}
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-surface">
                {product.images[0] ? (
                  product.images[0].mediaType === "VIDEO" ? (
                    <video
                      src={product.images[0].url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].altText ?? product.name}
                      fill
                      sizes="(min-width: 1024px) 45vw, 90vw"
                      className="object-cover"
                      priority
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                    Image à venir
                  </div>
                )}
              </div>

              {product.images.length > 1 ? (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {product.images.slice(1, 6).map((media) => (
                    <div
                      key={media.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-brand-surface"
                    >
                      {media.mediaType === "VIDEO" ? (
                        <video src={media.url} className="h-full w-full object-cover" muted />
                      ) : (
                        <Image
                          src={media.url}
                          alt={media.altText ?? product.name}
                          fill
                          sizes="20vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              {product.brand ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {product.brand.name}
                </span>
              ) : null}

              <div className="mt-1 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
                  {product.name}
                </h1>
                <span
                  className={
                    product.condition === "OCCASION"
                      ? "shrink-0 rounded-full bg-brand-navy px-2.5 py-1 text-xs font-semibold text-white"
                      : "shrink-0 rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-navy"
                  }
                >
                  {product.condition === "OCCASION" ? "Occasion" : "Neuf"}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-brand-navy">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount ? (
                  <span className="text-base text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <StockBadge stockQuantity={product.stockQuantity} />
              </div>

              {product.description ? (
                <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                  {product.description}
                </p>
              ) : null}

              <dl className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-neutral-100 bg-brand-surface p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-brand-navy">
                    Paiement à la livraison
                  </dt>
                  <dd className="text-neutral-500">
                    {product.codAvailable ? "Disponible" : "Non disponible pour cet article"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-navy">
                    Retrait en magasin
                  </dt>
                  <dd className="text-neutral-500">
                    {product.storePickupAvailable
                      ? "Disponible"
                      : "Non disponible pour cet article"}
                  </dd>
                </div>
              </dl>

              <AddToCartButton
                productId={product.id}
                stockQuantity={product.stockQuantity}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
