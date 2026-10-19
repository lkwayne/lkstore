import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LEGAL_LAST_UPDATE } from "@/config/legal";

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">{title}</h1>
          <p className="mt-1 text-xs text-neutral-400">Dernière mise à jour : {LEGAL_LAST_UPDATE}</p>
          {intro ? <p className="mt-4 text-sm text-neutral-600">{intro}</p> : null}
          <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-600 [&_a]:font-semibold [&_a]:text-brand-navy [&_a]:underline [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-brand-navy [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
