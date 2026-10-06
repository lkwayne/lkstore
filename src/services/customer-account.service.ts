import { createAdminClient } from "@/lib/supabase/admin";

export interface EnsureAccountResult {
  userId: string | null;
  isNewAccount: boolean;
  emailSent: boolean;
  error?: string;
}

/**
 * Crée automatiquement un compte client à la validation d'une commande en
 * mode invité, et déclenche un vrai email d'accès via le service de mail
 * intégré de Supabase (pas un simulacre — l'email part réellement).
 *
 * Fonctionnement :
 * 1. Crée le compte avec un mot de passe aléatoire fort, jamais transmis ni
 *    stocké en clair nulle part (le client ne le connaîtra jamais).
 * 2. Déclenche l'email "réinitialisation de mot de passe" natif de
 *    Supabase Auth, qui sert de lien d'accès pour que le client définisse
 *    lui-même son mot de passe.
 *
 * Limite assumée : utilise le service de mail intégré de Supabase (gratuit,
 * mais limité à quelques envois par heure sur le plan actuel, et avec le
 * template générique Supabase, pas un email à l'en-tête SENDUU). Pour un
 * vrai volume et un email de marque, configurer un SMTP personnalisé dans
 * Supabase (Authentication → Email Templates / SMTP Settings) — aucun
 * changement de code nécessaire ensuite, cette fonction continuera de
 * fonctionner telle quelle.
 *
 * Si un compte existe déjà pour cet email, ne fait rien (ne réinitialise
 * pas le mot de passe d'un compte existant sans son accord).
 */
export async function ensureCustomerAccount(params: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<EnsureAccountResult> {
  const { email, firstName, lastName, phone } = params;
  const admin = createAdminClient();

  const temporaryPassword = generateStrongRandomPassword();

  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
    },
  });

  if (createError) {
    const alreadyExists =
      createError.message.toLowerCase().includes("already") ||
      createError.message.toLowerCase().includes("registered");

    if (alreadyExists) {
      // Compte déjà existant : on ne touche pas à son mot de passe, on ne
      // renvoie pas d'email. Le client utilisera son compte existant.
      return { userId: null, isNewAccount: false, emailSent: false };
    }

    return {
      userId: null,
      isNewAccount: false,
      emailSent: false,
      error: createError.message,
    };
  }

  const userId = createData.user?.id ?? null;

  // Le lien d'accès mène à /reset-password : le client y choisit son mot de
  // passe, puis est connecté automatiquement.
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
  const { error: emailError } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (emailError) {
    // Le compte a bien été créé même si l'email échoue (ex : limite de
    // débit Supabase atteinte) — on le signale sans faire échouer la
    // commande, qui est déjà validée à ce stade.
    return { userId, isNewAccount: true, emailSent: false, error: emailError.message };
  }

  return { userId, isNewAccount: true, emailSent: true };
}

function generateStrongRandomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
