"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MAIN_NAV } from "@/config/brand";
import { useCart } from "@/components/CartProvider";
import type { MenuCategory } from "@/services/menu.service";

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

export function HeaderClient({ menu }: { menu: MenuCategory[] }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Détection du montage client, nécessaire pour ne rendre le portail
    // (createPortal vers document.body) qu'une fois côté navigateur — évite
    // un mismatch d'hydratation SSR/client. Pattern recommandé par React
    // pour ce cas précis, comme dans CartProvider.tsx.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);
  const { itemCount } = useCart();

  const headerElement = (
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

        <Link href="/" className="flex shrink-0 items-center" aria-label="SENDUU — Accueil">
          <Image
            src="/brand/senduu-logo-header.png"
            alt="SENDUU"
            width={140}
            height={94}
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
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-brand-navy hover:bg-brand-surface"
            aria-label={`Mon panier${itemCount > 0 ? ` (${itemCount} article${itemCount > 1 ? "s" : ""})` : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 ? (
              <span className="bg-brand-gradient absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {/* Recherche mobile */}
      <div className="px-4 pb-3 md:hidden">
        <SearchForm id="header-search-mobile" />
      </div>

      {/* Navigation desktop */}
      <nav className="relative hidden border-t border-neutral-100 md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-2.5 text-sm font-medium text-brand-navy">
          {MAIN_NAV.map((item) =>
            item.href === "/categories" && menu.length > 0 ? (
              <li
                key={item.href}
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
                onFocus={() => setMegaOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMegaOpen(false);
                }}
              >
                <Link
                  href={item.href}
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  onClick={() => setMegaOpen(false)}
                  className="transition-colors hover:text-brand-orange"
                >
                  {item.label} <span aria-hidden className="text-xs">▾</span>
                </Link>
                {megaOpen ? (
                  <div className="absolute inset-x-0 top-full z-50 border-b border-neutral-100 bg-white shadow-lg">
                    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-6 lg:grid-cols-4">
                      {menu.map((cat) => (
                        <div key={cat.slug}>
                          <Link
                            href={`/categories/${cat.slug}`}
                            onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-2 font-semibold text-brand-navy hover:text-brand-orange"
                          >
                            {cat.icon ? <span aria-hidden>{cat.icon}</span> : null}
                            {cat.name}
                          </Link>
                          <ul className="mt-2 space-y-1 text-[13px] font-normal text-neutral-500">
                            {cat.subcategories.slice(0, 5).map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={`/categories/${cat.slug}?sous-categorie=${sub.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="hover:text-brand-orange"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                            {cat.subcategories.length > 5 ? (
                              <li>
                                <Link
                                  href={`/categories/${cat.slug}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="font-medium text-brand-orange"
                                >
                                  Voir tout ({cat.subcategories.length})
                                </Link>
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            ) : (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-brand-orange">
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  );

  const mobileMenu = mobileMenuOpen ? (
    <div className="fixed inset-0 z-[999] md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      {/* Fond semi-transparent : la page reste visible derrière, un tap ferme le menu. */}
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={() => setMobileMenuOpen(false)}
        className="drawer-backdrop-in absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      {/* Panneau latéral : ne couvre qu'une partie de l'écran. */}
      <nav className="drawer-panel-in absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col overflow-y-auto rounded-r-3xl bg-white/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <Image src="/brand/senduu-logo-header.png" alt="SENDUU" width={120} height={80} className="h-8 w-auto" />
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
        {MAIN_NAV.map((item) =>
          item.href === "/categories" && menu.length > 0 ? (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => setMobileCategoriesOpen((v) => !v)}
                aria-expanded={mobileCategoriesOpen}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                {item.label}
                <span aria-hidden className="text-xs">{mobileCategoriesOpen ? "▲" : "▼"}</span>
              </button>
              {mobileCategoriesOpen ? (
                <ul className="bg-brand-surface text-sm">
                  <li>
                    <Link
                      href="/categories"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-8 py-3 font-semibold text-brand-orange"
                    >
                      Toutes les catégories
                    </Link>
                  </li>
                  {menu.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/categories/${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-8 py-3"
                      >
                        {cat.icon ? <span aria-hidden>{cat.icon}</span> : null}
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ) : (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-4"
              >
                {item.label}
              </Link>
            </li>
          )
        )}
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
      </nav>
    </div>
  ) : null;

  return (
    <>
      {headerElement}
      {mounted && mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
