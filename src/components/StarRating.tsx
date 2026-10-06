export function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-xl" : "text-sm";
  return (
    <span className={`${cls} tracking-tight`} aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-brand-orange" : "text-neutral-300"}>
          ★
        </span>
      ))}
    </span>
  );
}
