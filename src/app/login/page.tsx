"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { signIn } from "@/app/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const result = await signIn(data.email, data.password);
    if (result.success) {
      router.push("/account");
      router.refresh();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy">Connexion</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
                placeholder="Mot de passe"
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
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-brand-orange">
              Créer un compte
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
