import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  getCategories,
  getLatestProducts,
  getProductsByFlag,
} from "@/services/catalog.service";
import { getWishlistProductIds } from "@/services/wishlist.service";
import type { ProductSummary } from "@/types/catalog";

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function ProductShelf({
  title,
  href,
  products,
  favorites,
}: {
  title: string;
  href: string;
  products: ProductSummary[];
  favorites: Set<string>;
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-brand-orange hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} isFavorite={favorites.has(product.id)} />
        ))}
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [categories, flash, promos, featuredAll, latest, wishlistIds] = await Promise.all([
    getCategories(),
    safe(getProductsByFlag({ flag: "is_flash_deal", pageSize: 4 }).then((r) => r.items), []),
    safe(getProductsByFlag({ flag: "is_on_sale", pageSize: 4 }).then((r) => r.items), []),
    safe(getProductsByFlag({ flag: "is_featured", pageSize: 8 }).then((r) => r.items), []),
    safe(getLatestProducts(8), []),
    safe(getWishlistProductIds(), new Set<string>()),
  ]);
  const favorites = wishlistIds;
  // Un produit n'apparaît qu'une fois sur l'accueil : flash > promo > vedette > récent.
  const seen = new Set<string>();
  const take = (list: ProductSummary[]) => {
    const out = list.filter((p) => !seen.has(p.id));
    out.forEach((p) => seen.add(p.id));
    return out;
  };
  const flashShelf = take(flash);
  const promoShelf = take(promos);
  const featured = take(featuredAll);
  const latestOnly = take(latest).slice(0, 8);

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />

        <ProductShelf title="⚡ Flash Deals" href="/flash-deals" products={flashShelf} favorites={favorites} />
        <ProductShelf title="Promotions" href="/promotions" products={promoShelf} favorites={favorites} />
        <ProductShelf title="Produits vedettes" href="/categories" products={featured} favorites={favorites} />
        <ProductShelf
          title={featured.length > 0 ? "Derniers arrivages" : "Nos produits"}
          href="/nouveautes"
          products={latestOnly}
          favorites={favorites}
        />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">
              Parcourir par catégorie
            </h2>
            <Link
              href="/categories"
              className="text-sm font-semibold text-brand-orange hover:underline"
            >
              Voir tout
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">
              Aucune catégorie n&rsquo;est encore publiée. Ajoutez-en depuis
              le back-office pour qu&rsquo;elles apparaissent ici.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 text-center transition-shadow hover:shadow-lg hover:shadow-neutral-200/60"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-surface">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : category.icon ? (
                      <span className="text-2xl" aria-hidden>
                        {category.icon}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-brand-navy">
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-brand-navy group-hover:text-brand-orange">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
