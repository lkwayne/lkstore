import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ComingSoonSection } from "@/components/ComingSoonSection";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ComingSoonSection
          title="Contact"
          description="Un formulaire de contact et le bouton WhatsApp configurable seront ajoutés ici."
        />
      </main>
      <Footer />
    </>
  );
}
