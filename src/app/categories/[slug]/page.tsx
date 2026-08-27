import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getCategoryBySlug, getProductsByCategory } from "@/services/catalog.service";
import type { ProductSort } from "@/types/catalog";

export const dynamic = "force-dynamic";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "relevance", label: "Pertinence" },
  { value: "newest", label: "Nouveautés" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

function isProductSort(value: string | undefined): value is ProductSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — BENDO`,
    description: `Découvrez tous les produits ${category.name} disponibles sur BENDO.`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const sort = isProductSort(resolvedSearchParams.sort) ? resolvedSearchParams.sort : "relevance";

  const result = await getProductsByCategory({
    categoryId: category.id,
    page,
    sort,
  });

  const buildHref = (targetPage: number) =>
    `/categories/${slug}?page=${targetPage}${sort !== "relevance" ? `&sort=${sort}` : ""}`;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
                {category.name}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                {result.totalCount} produit{result.totalCount > 1 ? "s" : ""}
              </p>
            </div>

            <form method="GET" className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-neutral-500">
                Trier par
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-navy focus:border-brand-orange focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </form>
          </div>

          {result.items.length === 0 ? (
            <p className="mt-10 text-sm text-neutral-500">
              Aucun produit publié dans cette catégorie pour le moment.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            buildHref={buildHref}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
