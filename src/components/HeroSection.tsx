import Link from "next/link";
import Image from "next/image";

const TRUST_POINTS = [
  { label: "Achetez mieux", detail: "Un catalogue pensé pour votre quotidien" },
  { label: "Payez moins", detail: "Paiement à la livraison ou en magasin" },
  { label: "Nous livrons", detail: "Du panier jusqu'à votre porte, à Douala" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="bg-brand-gradient pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full opacity-10 blur-3xl sm:-right-20"
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
            Livraison à Douala &amp; environs
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
            <span className="text-brand-gradient">Achetez mieux, payez moins</span>
            <br />
            et on vous livre, où que vous soyez.
          </h1>

          <p className="mt-5 max-w-xl text-base text-neutral-500 sm:text-lg">
            Téléphones, informatique, électroménager, mode et bien plus —
            SENDUU rassemble ce dont vous avez besoin au quotidien, avec un
            paiement à la livraison ou en magasin, sans surprise.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="bg-brand-gradient inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 transition-transform hover:scale-[1.02]"
            >
              Découvrir le catalogue
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-7 py-3.5 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy"
            >
              Suivre ma commande
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-neutral-100 pt-6 sm:grid-cols-3">
            {TRUST_POINTS.map((point) => (
              <div key={point.label}>
                <dt className="text-sm font-semibold text-brand-navy">
                  {point.label}
                </dt>
                <dd className="mt-0.5 text-xs text-neutral-500">
                  {point.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="relative">
            <div
              aria-hidden
              className="bg-brand-gradient absolute inset-0 -z-10 scale-90 rounded-[3rem] opacity-15 blur-2xl"
            />
            <Image
              src="/brand/senduu-icon-512.png"
              alt="SENDUU"
              width={340}
              height={340}
              priority
              className="w-56 drop-shadow-xl sm:w-72 lg:w-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
