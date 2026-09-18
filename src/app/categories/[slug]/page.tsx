import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { getCategoryBySlug, getProductsByCategory, listSubcategories, getBrandsInCategory } from "@/services/catalog.service";
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
    title: `${category.name} — SENDUU`,
    description: `Découvrez tous les produits ${category.name} disponibles sur SENDUU.`,
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    "sous-categorie"?: string;
    marque?: string;
    prix_min?: string;
    prix_max?: string;
  }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [subcategories, brands] = await Promise.all([
    listSubcategories(category.id),
    getBrandsInCategory(category.id),
  ]);
  const activeSubcategorySlug = resolvedSearchParams["sous-categorie"];
  const activeSubcategory = subcategories.find((s) => s.slug === activeSubcategorySlug);
  const activeBrandId = resolvedSearchParams.marque || undefined;
  const minPrice = resolvedSearchParams.prix_min ? Number(resolvedSearchParams.prix_min) : undefined;
  const maxPrice = resolvedSearchParams.prix_max ? Number(resolvedSearchParams.prix_max) : undefined;

  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const sort = isProductSort(resolvedSearchParams.sort) ? resolvedSearchParams.sort : "relevance";

  const result = await getProductsByCategory({
    categoryId: category.id,
    subcategoryId: activeSubcategory?.id,
    brandId: activeBrandId,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    page,
    sort,
  });

  const persistentParams =
    (sort !== "relevance" ? `&sort=${sort}` : "") +
    (activeSubcategory ? `&sous-categorie=${activeSubcategory.slug}` : "") +
    (activeBrandId ? `&marque=${activeBrandId}` : "") +
    (minPrice != null ? `&prix_min=${minPrice}` : "") +
    (maxPrice != null ? `&prix_max=${maxPrice}` : "");

  const buildHref = (targetPage: number) => `/categories/${slug}?page=${targetPage}${persistentParams}`;

  const filterParamsWithoutSubcategory =
    (sort !== "relevance" ? `&sort=${sort}` : "") +
    (activeBrandId ? `&marque=${activeBrandId}` : "") +
    (minPrice != null ? `&prix_min=${minPrice}` : "") +
    (maxPrice != null ? `&prix_max=${maxPrice}` : "");

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

            <form method="GET" className="flex flex-wrap items-center gap-2">
              {activeSubcategory ? (
                <input type="hidden" name="sous-categorie" value={activeSubcategory.slug} />
              ) : null}

              {brands.length > 0 ? (
                <select
                  name="marque"
                  defaultValue={activeBrandId ?? ""}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-navy focus:border-brand-orange focus:outline-none"
                >
                  <option value="">Toutes les marques</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <input
                type="number"
                name="prix_min"
                placeholder="Prix min"
                defaultValue={minPrice ?? ""}
                className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-navy focus:border-brand-orange focus:outline-none"
              />
              <span className="text-sm text-neutral-400">—</span>
              <input
                type="number"
                name="prix_max"
                placeholder="Prix max"
                defaultValue={maxPrice ?? ""}
                className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-brand-navy focus:border-brand-orange focus:outline-none"
              />

              <select
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

              <button
                type="submit"
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
              >
                Filtrer
              </button>

              {activeBrandId || minPrice != null || maxPrice != null ? (
                <a
                  href={`/categories/${slug}${activeSubcategory ? `?sous-categorie=${activeSubcategory.slug}` : ""}`}
                  className="text-sm text-neutral-400 underline hover:text-brand-orange"
                >
                  Réinitialiser
                </a>
              ) : null}
            </form>
          </div>

          {subcategories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`/categories/${slug}${filterParamsWithoutSubcategory ? `?${filterParamsWithoutSubcategory.slice(1)}` : ""}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  !activeSubcategory
                    ? "border-brand-orange bg-brand-surface text-brand-navy"
                    : "border-neutral-200 text-neutral-500 hover:border-brand-orange"
                }`}
              >
                Tout
              </a>
              {subcategories.map((sub) => (
                <a
                  key={sub.id}
                  href={`/categories/${slug}?sous-categorie=${sub.slug}${filterParamsWithoutSubcategory}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeSubcategory?.id === sub.id
                      ? "border-brand-orange bg-brand-surface text-brand-navy"
                      : "border-neutral-200 text-neutral-500 hover:border-brand-orange"
                  }`}
                >
                  {sub.icon ? <span aria-hidden>{sub.icon}</span> : null}
                  {sub.name}
                </a>
              ))}
            </div>
          ) : null}

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
