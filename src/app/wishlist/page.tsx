import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getCurrentUser } from "@/services/auth.service";
import { getWishlistProducts } from "@/services/wishlist.service";

export const dynamic = "force-dynamic";

export const metadata = { title: "Mes favoris — SENDUU" };

export default async function WishlistPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
            <h1 className="text-2xl font-bold text-brand-navy">Mes favoris</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Connectez-vous pour voir et gérer vos favoris.
            </p>
            <Link
              href="/login"
              className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const products = await getWishlistProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Mes favoris
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} produit{products.length > 1 ? "s" : ""}
          </p>

          {products.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-neutral-500">
                Vous n&rsquo;avez pas encore ajouté de favoris.
              </p>
              <Link
                href="/categories"
                className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
              >
                Découvrir le catalogue
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} isFavorite />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
