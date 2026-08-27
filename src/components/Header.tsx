"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MAIN_NAV } from "@/config/brand";

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path
        d="M12 20.5s-7.5-4.6-10-9.2C.4 7.8 2.3 4.5 5.7 4.5c2 0 3.5 1 6.3 4 2.8-3 4.3-4 6.3-4 3.4 0 5.3 3.3 3.7 6.8-2.5 4.6-10 9.2-10 9.2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M3 4h2l1.6 12.2a2 2 0 0 0 2 1.8h8.8a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="21" r="1.4" />
      <circle cx="18" cy="21" r="1.4" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function SearchForm({ id, className }: { id: string; className?: string }) {
  return (
    <form action="/search" method="GET" role="search" className={className}>
      <label htmlFor={id} className="sr-only">
        Rechercher un produit
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          id={id}
          name="q"
          type="search"
          placeholder="Rechercher un téléphone, un article..."
          className="w-full rounded-full border border-neutral-200 bg-brand-surface py-2.5 pl-10 pr-4 text-sm text-brand-navy placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
        />
      </div>
    </form>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur">
      {/* Ligne principale */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy md:hidden"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <Link href="/" className="flex shrink-0 items-center" aria-label="BENDO — Accueil">
          <Image
            src="/brand/bendo-logo-header.png"
            alt="BENDO"
            width={140}
            height={91}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <SearchForm id="header-search-desktop" className="hidden flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/account"
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-brand-navy hover:bg-brand-surface sm:flex"
            aria-label="Mon compte"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-lg text-brand-navy hover:bg-brand-surface sm:flex"
            aria-label="Mes favoris"
          >
            <HeartIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy hover:bg-brand-surface"
            aria-label="Mon panier"
          >
            <CartIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Recherche mobile */}
      <div className="px-4 pb-3 md:hidden">
        <SearchForm id="header-search-mobile" />
      </div>

      {/* Navigation desktop */}
      <nav className="hidden border-t border-neutral-100 md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2.5 text-sm font-medium text-brand-navy">
          {MAIN_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="transition-colors hover:text-brand-orange">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu mobile plein écran */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <Image src="/brand/bendo-logo-header.png" alt="BENDO" width={120} height={78} className="h-8 w-auto" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy"
              aria-label="Fermer le menu"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-neutral-100 text-base font-medium text-brand-navy">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4">
                Mon compte
              </Link>
            </li>
            <li>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-6 py-4">
                Mes favoris
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
