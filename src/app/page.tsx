import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ComingSoonSection
          title="Catégories, promotions et meilleures ventes arrivent bientôt"
          description="Le design system et le header sont en place. Le catalogue produit se branche sur cette base au prochain lot."
        />
      </main>
      <Footer />
    </>
  );
}
