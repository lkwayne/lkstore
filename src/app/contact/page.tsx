import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContactChannels } from "@/config/contact";

export const metadata = { title: "Contact — SENDUU" };

export default function ContactPage() {
  const c = getContactChannels();
  const hasChannel = Boolean(c.whatsappUrl || c.phoneHref || c.email);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">Nous contacter</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Une question sur un produit, une commande ou une livraison ? Écrivez-nous.
          </p>

          {hasChannel ? (
            <div className="mt-8 space-y-3">
              {c.whatsappUrl ? (
                <a
                  href={c.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-gradient flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white"
                >
                  Discuter sur WhatsApp
                </a>
              ) : null}
              {c.phoneHref ? (
                <a
                  href={c.phoneHref}
                  className="flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-brand-navy"
                >
                  Appeler {c.phoneDisplay}
                </a>
              ) : null}
              {c.email ? (
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-brand-navy"
                >
                  {c.email}
                </a>
              ) : null}
              {c.hours ? <p className="pt-2 text-center text-xs text-neutral-400">{c.hours}</p> : null}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-brand-surface p-4 text-sm text-neutral-600">
              Nos canaux de contact seront affichés ici très bientôt.
            </p>
          )}

          <p className="mt-10 text-sm text-neutral-500">
            Pour savoir où en est votre colis, utilisez le{" "}
            <Link href="/track-order" className="font-semibold text-brand-navy underline">
              suivi de commande
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
