import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { getCategories } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />

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
