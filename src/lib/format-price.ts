const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XAF",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return formatter.format(amount).replace("XAF", "FCFA");
}
