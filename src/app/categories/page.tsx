import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCategories } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catégories — BENDO",
  description: "Parcourez toutes les catégories de produits BENDO.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

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
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
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
        </div>
      </main>
      <Footer />
    </>
  );
}
