"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Footer } from "@/components/Footer";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";
import { createRecoveryClient } from "@/lib/supabase/recovery-client";

export function ForgotPasswordPageClient({ header }: { header: React.ReactNode }) {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);
    const client = createRecoveryClient();
    const { error } = await client.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // On ne révèle jamais si l'email existe. Seule une limite de débit est signalée.
    if (error && /rate limit|too many|seconds/i.test(error.message)) {
      setServerError("Trop de demandes. Patientez quelques minutes avant de réessayer.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      {header}
      <main className="flex-1">
        <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy">Mot de passe oublié</h1>

          {sent ? (
            <div className="mt-6 rounded-xl bg-brand-surface p-4 text-sm text-neutral-600">
              Si un compte existe avec cet email, un lien pour choisir un nouveau mot de passe
              vient de lui être envoyé. Pensez à vérifier vos courriers indésirables.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <p className="text-sm text-neutral-500">
                Entrez l&apos;email de votre compte. Nous vous envoyons un lien pour choisir un
                nouveau mot de passe.
              </p>
              <div>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                {errors.email ? (
                  <p className="mt-1 text-xs text-brand-red">{errors.email.message}</p>
                ) : null}
              </div>
              {serverError ? (
                <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
                  {serverError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-gradient w-full rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Envoi…" : "Envoyer le lien"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link href="/login" className="font-semibold text-brand-orange">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
