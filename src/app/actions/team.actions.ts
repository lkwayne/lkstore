"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/services/auth.service";
import { createTeamMember, setMemberRole } from "@/services/team.service";
import { teamMemberSchema, type TeamMemberInput } from "@/schemas/team.schema";
import { USER_ROLES, type UserRole } from "@/config/enums";

export type CreateMemberActionResult =
  | { success: true; email: string; temporaryPassword: string | null }
  | { success: false; error: string };

export async function addTeamMember(input: TeamMemberInput): Promise<CreateMemberActionResult> {
  try {
    const actor = await requireSuperAdmin();
    const parsed = teamMemberSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
    }
    const res = await createTeamMember(parsed.data, actor.id);
    revalidatePath("/admin/team");
    return { success: true, email: res.email, temporaryPassword: res.temporaryPassword };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
}

export async function changeMemberRole(
  userId: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await requireSuperAdmin();
    if (!(USER_ROLES as readonly string[]).includes(role)) {
      return { success: false, error: "Rôle inconnu." };
    }
    await setMemberRole(userId, role as UserRole, actor.id);
    revalidatePath("/admin/team");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Erreur inconnue." };
  }
}
