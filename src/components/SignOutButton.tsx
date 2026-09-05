"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/actions/auth.actions";

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOut();
          router.push("/");
          router.refresh();
        });
      }}
      className="rounded-full border border-neutral-200 px-6 py-2.5 text-sm font-semibold text-brand-navy disabled:opacity-60"
    >
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
