import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { STAFF_ROLES, USER_ROLES, type UserRole } from "@/config/enums";
import type { TeamMemberInput } from "@/schemas/team.schema";

/**
 * Gestion d'équipe : utilise la clé service_role. Toutes les fonctions ici
 * doivent être appelées APRÈS `requireSuperAdmin()` (voir team.actions.ts).
 */

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
}

type ProfilesTable = {
  select: (cols: string) => {
    neq: (col: string, val: string) => PromiseLike<{
      data: { id: string; first_name: string | null; last_name: string | null; phone: string | null; role: UserRole }[] | null;
      error: { message: string } | null;
    }>;
  };
  update: (row: Record<string, unknown>) => {
    eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>;
  };
  upsert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
};
type AuditTable = {
  insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
};

function tables() {
  const admin = createAdminClient();
  return {
    admin,
    profiles: admin.from("profiles") as unknown as ProfilesTable,
    audit: admin.from("audit_logs") as unknown as AuditTable,
  };
}

async function findUserByEmail(email: string) {
  const { admin } = tables();
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("Impossible de lire les comptes.");
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

export async function listTeam(): Promise<TeamMember[]> {
  const { admin, profiles } = tables();
  const { data, error } = await profiles
    .select("id, first_name, last_name, phone, role")
    .neq("role", "CUSTOMER");
  if (error) throw new Error("Impossible de charger l'équipe.");

  const emails = new Map<string, string>();
  const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  users?.users.forEach((u) => emails.set(u.id, u.email ?? ""));

  return (data ?? [])
    .map((p) => ({
      id: p.id,
      firstName: p.first_name ?? "",
      lastName: p.last_name ?? "",
      email: emails.get(p.id) ?? "",
      phone: p.phone,
      role: p.role,
    }))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 12 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

export type CreateMemberResult = {
  userId: string;
  email: string;
  /** Mot de passe provisoire — affiché une seule fois ; null si compte existant. */
  temporaryPassword: string | null;
};

export async function createTeamMember(
  input: TeamMemberInput,
  actorId: string
): Promise<CreateMemberResult> {
  const { admin, profiles, audit } = tables();
  const existing = await findUserByEmail(input.email);

  let userId: string;
  let temporaryPassword: string | null = null;

  if (existing) {
    userId = existing.id;
  } else {
    temporaryPassword = generatePassword();
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone ?? null,
      },
    });
    if (error || !data.user) throw new Error("Création du compte impossible : " + (error?.message ?? ""));
    userId = data.user.id;
  }

  // Le trigger crée le profil en CUSTOMER ; on assure sa présence puis on fixe le rôle.
  const { error: upsertError } = await profiles.upsert({
    id: userId,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone ?? null,
    role: input.role,
  });
  if (upsertError) throw new Error("Rôle non enregistré : " + upsertError.message);

  await audit.insert({
    actor_id: actorId,
    action: existing ? "TEAM_ROLE_GRANTED" : "TEAM_MEMBER_CREATED",
    entity_type: "profile",
    entity_id: userId,
    metadata: { role: input.role, email: input.email },
  });

  return { userId, email: input.email, temporaryPassword };
}

export async function setMemberRole(
  userId: string,
  role: UserRole,
  actorId: string
): Promise<void> {
  if (userId === actorId) {
    throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  }
  if (!USER_ROLES.includes(role)) throw new Error("Rôle inconnu.");

  const { profiles, audit } = tables();
  const { error } = await profiles.update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);

  await audit.insert({
    actor_id: actorId,
    action: role === "CUSTOMER" ? "TEAM_ACCESS_REVOKED" : "TEAM_ROLE_CHANGED",
    entity_type: "profile",
    entity_id: userId,
    metadata: { role },
  });
}

export const ASSIGNABLE_ROLES = STAFF_ROLES;
