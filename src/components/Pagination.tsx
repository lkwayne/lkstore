import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      aria-label="Pagination des produits"
      className="mt-8 flex items-center justify-center gap-4"
    >
      <Link
        href={buildHref(prevPage)}
        aria-disabled={currentPage === 1}
        className={`rounded-full border px-4 py-2 text-sm font-medium ${
          currentPage === 1
            ? "pointer-events-none border-neutral-100 text-neutral-300"
            : "border-neutral-200 text-brand-navy hover:border-brand-navy"
        }`}
      >
        Précédent
      </Link>
      <span className="text-sm text-neutral-500">
        Page {currentPage} sur {totalPages}
      </span>
      <Link
        href={buildHref(nextPage)}
        aria-disabled={currentPage === totalPages}
        className={`rounded-full border px-4 py-2 text-sm font-medium ${
          currentPage === totalPages
            ? "pointer-events-none border-neutral-100 text-neutral-300"
            : "border-neutral-200 text-brand-navy hover:border-brand-navy"
        }`}
      >
        Suivant
      </Link>
    </nav>
  );
}
