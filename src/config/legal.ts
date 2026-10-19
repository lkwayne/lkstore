/**
 * Identité de l'exploitant, lue depuis l'environnement. Aucune valeur inventée :
 * une information non renseignée n'est simplement pas affichée.
 */
export function getLegalInfo() {
  const v = (x: string | undefined) => (x ?? "").trim() || null;
  return {
    company: v(process.env.NEXT_PUBLIC_LEGAL_COMPANY) ?? "LK Tech Solutions",
    form: v(process.env.NEXT_PUBLIC_LEGAL_FORM), // ex. « SARL »
    rccm: v(process.env.NEXT_PUBLIC_LEGAL_RCCM),
    niu: v(process.env.NEXT_PUBLIC_LEGAL_NIU),
    address: v(process.env.NEXT_PUBLIC_LEGAL_ADDRESS) ?? "Douala, Cameroun",
  };
}

export const LEGAL_LAST_UPDATE = "19 octobre 2026";
