import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function MeilleuresVentesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Meilleures ventes"
          description="Le classement des produits les plus vendus arrive avec le catalogue."
        />
      </main>
      <Footer />
    </>
  );
}
