"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { signupSchema, type SignupInput } from "@/schemas/auth.schema";
import { signUp } from "@/app/actions/auth.actions";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data: SignupInput) {
    setServerError(null);
    const result = await signUp(data);
    if (result.success) {
      setSuccess(true);
    } else {
      setServerError(result.error);
    }
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
            <h1 className="text-2xl font-bold text-brand-navy">
              Compte créé
            </h1>
            <p className="mt-3 text-sm text-neutral-500">
              Vous pouvez maintenant vous connecter.
            </p>
            <Link
              href="/login"
              className="bg-brand-gradient mt-6 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white"
            >
              Se connecter
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy">Créer un compte</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...register("firstName")}
                  placeholder="Prénom"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                {errors.firstName ? (
                  <p className="mt-1 text-xs text-brand-red">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div>
                <input
                  {...register("lastName")}
                  placeholder="Nom"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
                />
                {errors.lastName ? (
                  <p className="mt-1 text-xs text-brand-red">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>
            <div>
              <input
                {...register("phone")}
                placeholder="Téléphone"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
              />
              {errors.phone ? (
                <p className="mt-1 text-xs text-brand-red">{errors.phone.message}</p>
              ) : null}
            </div>
            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-brand-red">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <input
                {...register("password")}
                type="password"
                placeholder="Mot de passe (6 caractères min.)"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none"
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-brand-red">{errors.password.message}</p>
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
              {isSubmitting ? "Création…" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-brand-orange">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
