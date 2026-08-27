import Image from "next/image";
import Link from "next/link";
import { MAIN_NAV } from "@/config/brand";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-100 bg-brand-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Image
          src="/brand/bendo-logo-header.png"
          alt="BENDO"
          width={120}
          height={78}
          className="h-8 w-auto"
        />
        <p className="mt-3 max-w-sm text-sm text-neutral-500">
          Tout ce qu&rsquo;il vous faut, à Douala et bientôt partout au
          Cameroun.
        </p>

        <nav aria-label="Liens du pied de page" className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-navy">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-brand-orange">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-8 text-xs text-neutral-400">
          © {new Date().getFullYear()} BENDO. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
