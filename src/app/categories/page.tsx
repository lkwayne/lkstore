import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Catégories"
          description="Le catalogue complet par catégorie (téléphones, informatique, mode, maison...) arrive au prochain lot."
        />
      </main>
      <Footer />
    </>
  );
}
