"use client";

import { useState, useTransition } from "react";
import { addTeamMember, changeMemberRole } from "@/app/actions/team.actions";
import { ROLE_LABELS, STAFF_ROLES, type UserRole } from "@/config/enums";
import type { TeamMember } from "@/services/team.service";

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none";

export function TeamManager({ team, currentUserId }: { team: TeamMember[]; currentUserId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string | null } | null>(null);
  const [pending, startTransition] = useTransition();

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setCreated(null);
    startTransition(async () => {
      const res = await addTeamMember({
        firstName: String(fd.get("firstName") ?? ""),
        lastName: String(fd.get("lastName") ?? ""),
        email: String(fd.get("email") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        role: String(fd.get("role") ?? ""),
      });
      if (res.success) {
        setCreated({ email: res.email, password: res.temporaryPassword });
        form.reset();
      } else {
        setError(res.error);
      }
    });
  }

  function onChangeRole(userId: string, role: string) {
    setError(null);
    startTransition(async () => {
      const res = await changeMemberRole(userId, role);
      if (!res.success) setError(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="mt-6 space-y-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold text-brand-navy">Ajouter un membre</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="firstName" required placeholder="Prénom" className={inputClass} />
          <input name="lastName" required placeholder="Nom" className={inputClass} />
          <input name="email" type="email" required placeholder="Email" className={inputClass} />
          <input name="phone" placeholder="Téléphone (optionnel)" className={inputClass} />
          <select name="role" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choisir un rôle
            </option>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <button
            disabled={pending}
            className="bg-brand-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Création…" : "Créer le compte"}
          </button>
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          Si l&apos;email a déjà un compte (un client par exemple), le rôle lui est simplement
          attribué. Un super administrateur peut en nommer d&apos;autres.
        </p>

        {created ? (
          <div className="mt-4 rounded-xl border border-brand-orange/40 bg-brand-surface p-4 text-sm">
            <p className="font-semibold text-brand-navy">Compte prêt : {created.email}</p>
            {created.password ? (
              <>
                <p className="mt-2 text-neutral-600">
                  Mot de passe provisoire (affiché une seule fois, transmettez-le en privé) :
                </p>
                <p className="mt-1 select-all rounded-lg bg-white px-3 py-2 font-mono text-base tracking-wide">
                  {created.password}
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  La personne peut ensuite le changer via « Mot de passe oublié ».
                </p>
              </>
            ) : (
              <p className="mt-2 text-neutral-600">
                Ce compte existait déjà : il garde son mot de passe actuel.
              </p>
            )}
          </div>
        ) : null}
      </section>

      {error ? <p className="text-sm text-brand-red">{error}</p> : null}

      <section>
        <h2 className="font-semibold text-brand-navy">Membres ({team.length})</h2>
        <ul className="mt-3 space-y-2">
          {team.map((m) => {
            const isSelf = m.id === currentUserId;
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    {m.firstName} {m.lastName} {isSelf ? "(vous)" : ""}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                {isSelf ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
                    {ROLE_LABELS[m.role]}
                  </span>
                ) : (
                  <select
                    disabled={pending}
                    value={m.role}
                    onChange={(e) => {
                      const next = e.target.value as UserRole;
                      if (
                        next !== "CUSTOMER" ||
                        confirm(`Retirer l'accès staff à ${m.firstName} ?`)
                      ) {
                        onChangeRole(m.id, next);
                      }
                    }}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  >
                    {STAFF_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                    <option value="CUSTOMER">Retirer l&apos;accès staff</option>
                  </select>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
