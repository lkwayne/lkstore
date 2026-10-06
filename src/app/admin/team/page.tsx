import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import { listTeam } from "@/services/team.service";
import { TeamManager } from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const user = await getCurrentUser();
  if (user?.profile?.role !== "SUPER_ADMIN") redirect("/admin");

  const team = await listTeam();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Équipe</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Créez les comptes de vos collaborateurs et attribuez leurs rôles. Seuls les super
        administrateurs voient cette page.
      </p>
      <TeamManager team={team} currentUserId={user.id} />
    </div>
  );
}
