/**
 * Coordonnées de contact SENDUU, lues depuis les variables d'environnement
 * (aucune valeur codée en dur). Un canal non configuré n'est tout simplement
 * pas affiché — rien n'est simulé.
 */
function digits(v: string | undefined): string | null {
  const d = (v ?? "").replace(/\D/g, "");
  return d.length >= 8 ? d : null;
}

export function getContactChannels() {
  const whatsapp = digits(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP);
  const phone = digits(process.env.NEXT_PUBLIC_SUPPORT_PHONE);
  const email = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "").trim() || null;
  const hours = (process.env.NEXT_PUBLIC_SUPPORT_HOURS ?? "").trim() || null;
  return {
    whatsappUrl: whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour SENDUU, j'ai une question.")}`
      : null,
    phoneDisplay: phone ? `+${phone}` : null,
    phoneHref: phone ? `tel:+${phone}` : null,
    email,
    hours,
  };
}
