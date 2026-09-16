import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCategories, listSubcategories } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catégories — SENDUU",
  description: "Parcourez toutes les catégories de produits SENDUU.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const subcategoriesByCategory = await Promise.all(
    categories.map((category) => listSubcategories(category.id))
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Toutes les catégories
          </h1>

          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-neutral-500">
              Aucune catégorie n&rsquo;est encore publiée. Ajoutez-en depuis
              le back-office pour qu&rsquo;elles apparaissent ici.
            </p>
          ) : (
            <div className="mt-8 space-y-8">
              {categories.map((category, index) => {
                const subcategories = subcategoriesByCategory[index];
                return (
                  <section key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="group flex items-center gap-3"
                    >
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-surface">
                        {category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt={category.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : category.icon ? (
                          <span className="text-xl" aria-hidden>
                            {category.icon}
                          </span>
                        ) : (
                          <span className="text-base font-bold text-brand-navy">
                            {category.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-brand-navy group-hover:text-brand-orange">
                        {category.name}
                      </h2>
                    </Link>

                    {subcategories.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/categories/${category.slug}?sous-categorie=${sub.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-navy transition-colors hover:border-brand-orange hover:text-brand-orange"
                          >
                            {sub.icon ? (
                              <span aria-hidden>{sub.icon}</span>
                            ) : null}
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
