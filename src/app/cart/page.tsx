import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Votre panier"
          description="Le panier persistant (ajout, quantité, disponibilité en temps réel) arrive avec le module Panier."
        />
      </main>
      <Footer />
    </>
  );
}
