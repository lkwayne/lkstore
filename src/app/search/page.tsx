import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { searchProducts } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recherche — BENDO",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const trimmedQuery = q.trim();

  const result = trimmedQuery
    ? await searchProducts({ query: trimmedQuery, page })
    : { items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 1 };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            {trimmedQuery ? (
              <>
                Résultats pour <span className="text-brand-gradient">&laquo;&nbsp;{trimmedQuery}&nbsp;&raquo;</span>
              </>
            ) : (
              "Recherche"
            )}
          </h1>

          {trimmedQuery ? (
            <p className="mt-1 text-sm text-neutral-500">
              {result.totalCount} résultat{result.totalCount > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">
              Utilisez la barre de recherche en haut de page pour trouver un
              produit par nom, SKU ou marque.
            </p>
          )}

          {trimmedQuery && result.items.length === 0 ? (
            <p className="mt-10 text-sm text-neutral-500">
              Aucun produit ne correspond à &laquo;&nbsp;{trimmedQuery}
              &nbsp;&raquo;. Vérifiez l&rsquo;orthographe ou essayez un terme
              plus général.
            </p>
          ) : null}

          {result.items.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            buildHref={(targetPage) =>
              `/search?q=${encodeURIComponent(trimmedQuery)}&page=${targetPage}`
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
