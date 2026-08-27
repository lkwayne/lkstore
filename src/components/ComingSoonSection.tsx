export function ComingSoonSection({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <span className="mb-4 inline-flex items-center rounded-full bg-brand-surface px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-navy">
        Bientôt disponible
      </span>
      <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-sm text-neutral-500 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
