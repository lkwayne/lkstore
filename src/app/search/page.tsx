import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Résultats de recherche"
          description="La recherche produit (nom, SKU, marque, catégorie) arrive avec le module Catalogue."
        />
      </main>
      <Footer />
    </>
  );
}
