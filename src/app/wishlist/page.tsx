import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Mes favoris"
          description="La liste de vos produits favoris sera disponible une fois le catalogue branché."
        />
      </main>
      <Footer />
    </>
  );
}
