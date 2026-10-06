/**
 * Envoi d'accès client par WhatsApp — préparé, mais INACTIF tant que l'API
 * WhatsApp Business (Meta Cloud API) n'est pas réellement connectée.
 *
 * Ce module ne simule jamais un envoi réussi : tant que les identifiants
 * ci-dessous ne sont pas renseignés, sendWhatsAppAccessMessage() ne tente
 * aucun appel réseau et retourne honnêtement `sent: false`.
 *
 * Pour activer, une fois le compte WhatsApp Business Platform de Meta créé
 * et approuvé :
 *   1. Ajouter dans les variables d'environnement (Vercel + .env.local) :
 *        WHATSAPP_ACCESS_TOKEN=...        (token permanent de l'app Meta)
 *        WHATSAPP_PHONE_NUMBER_ID=...     (identifiant du numéro expéditeur)
 *        WHATSAPP_ACCOUNT_TEMPLATE_NAME=...  (nom du template approuvé, voir ci-dessous)
 *   2. Faire approuver par Meta un template de message "utility" (catégorie
 *      obligatoire pour un message business-initié hors fenêtre de 24h) —
 *      par exemple nommé "account_access", avec des variables {{1}} (prénom)
 *      et {{2}} (lien de connexion). Un message en texte libre NE PEUT PAS
 *      être envoyé à un client qui n'a pas écrit en premier — c'est une
 *      règle de la plateforme WhatsApp, pas une limite de ce code.
 *   3. Aucune autre modification de code n'est nécessaire : dès que les
 *      trois variables sont présentes, isWhatsAppConfigured() passe à true
 *      et sendWhatsAppAccessMessage() envoie réellement le message via
 *      l'API Graph de Meta.
 */

export interface WhatsAppSendResult {
  sent: boolean;
  reason?: string;
}

export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCOUNT_TEMPLATE_NAME
  );
}

/**
 * Envoie (ou non) un message WhatsApp "vos accès SENDUU" à un client.
 * `phone` doit être au format international sans "+" (ex: 237690000000).
 */
export async function sendWhatsAppAccessMessage(params: {
  phone: string;
  firstName: string;
  loginUrl: string;
}): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured()) {
    return {
      sent: false,
      reason:
        "API WhatsApp Business non configurée — WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCOUNT_TEMPLATE_NAME manquants.",
    };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const templateName = process.env.WHATSAPP_ACCOUNT_TEMPLATE_NAME;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: params.phone.replace(/[^0-9]/g, ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: "fr" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: params.firstName },
                  { type: "text", text: params.loginUrl },
                ],
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return { sent: false, reason: `Meta a refusé l'envoi : ${body}` };
    }

    return { sent: true };
  } catch (err) {
    return {
      sent: false,
      reason: err instanceof Error ? err.message : "Erreur réseau inconnue.",
    };
  }
}
