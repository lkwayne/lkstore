"use server";

import { createClient } from "@/lib/supabase/server";
import { allowRequest, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type AuthResult = { success: true } | { success: false; error: string };

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("User already registered")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return "Une erreur est survenue. Réessayez.";
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const ip = await getClientIp();
  const [ipOk, emailOk] = await Promise.all([
    allowRequest("login:ip", ip, 20, 15 * 60),
    allowRequest("login:email", email, 8, 15 * 60),
  ]);
  if (!ipOk || !emailOk) return { success: false, error: RATE_LIMIT_MESSAGE };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
  return { success: true };
}

export async function signUp(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<AuthResult> {
  if (!(await allowRequest("signup:ip", await getClientIp(), 5, 60 * 60))) {
    return { success: false, error: RATE_LIMIT_MESSAGE };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      },
    },
  });

  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
