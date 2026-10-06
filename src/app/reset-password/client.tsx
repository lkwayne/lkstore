"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Footer } from "@/components/Footer";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";
import { createRecoveryClient } from "@/lib/supabase/recovery-client";
import { signIn } from "@/app/actions/auth.actions";

type Phase = "checking" | "ready" | "invalid";

export function ResetPasswordPageClient({ header }: { header: React.ReactNode }) {
  const router = useRouter();
  // Créé côté navigateur uniquement (le lien de récupération est lu dans l'URL).
  const [client] = useState(() => (typeof window === "undefined" ? null : createRecoveryClient()));
  const [email, setEmail] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    // Le client lit lui-même la session de récupération dans l'URL du lien.
    if (!client) return;
    let done = false;

    function accept(userEmail: string | undefined) {
      if (done) return;
      done = true;
      setEmail(userEmail ?? null);
      setPhase("ready");
    }

    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        accept(session.user.email);
      }
    });

    const timer = window.setTimeout(async () => {
      if (done) return;
      const { data } = await client.auth.getSession();
      if (data.session) accept(data.session.user.email);
      else setPhase("invalid");
    }, 1500);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [client]);

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);
    if (!client) return;
    const { error } = await client.auth.updateUser({ password: data.password });
    if (error) {
      setServerError(
        /same|different/i.test(error.message)
          ? "Choisissez un mot de passe différent de l'ancien."
          : "Impossible de modifier le mot de passe. Le lien a peut-être expiré."
      );
      return;
    }
    if (email) {
      const login = await signIn(email, data.password);
      if (login.success) {
        router.push("/account");
        router.refresh();
        return;
      }
    }
    router.push("/login");
  }

  return (
    <>
      {header}
      <main className="flex-1">
        <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy">Nouveau mot de passe</h1>

          {phase === "checking" ? (
            <p className="mt-6 text-sm text-neutral-500">Vérification du lien…</p>
          ) : null}

          {phase === "invalid" ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-lg bg-brand-red/10 px-4 py-3 text-sm text-brand-red">
                Ce lien est invalide ou a expiré. Demandez-en un nouveau.
              </p>
              <Link
                href="/forgot-password"
                className="bg-brand-gradient block rounded-full px-6 py-3 text-center text-sm font-semibold text-white"
              >
                Recevoir un nouveau lien
              </Link>
            </div>
          ) : null}

          {phase === "ready" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                {errors.password ? (
                  <p className="mt-1 text-xs text-brand-red">{errors.password.message}</p>
                ) : null}
              </div>
              <div>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirmez le mot de passe"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-brand-red">{errors.confirmPassword.message}</p>
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
                {isSubmitting ? "Enregistrement…" : "Enregistrer et me connecter"}
              </button>
            </form>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
