import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SignOutButton } from "@/components/SignOutButton";
import { getCurrentUser, isStaffRole } from "@/services/auth.service";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  LOGISTICS: "Logistique",
  CUSTOMER_SUPPORT: "Support client",
  MARKETING: "Marketing",
  CUSTOMER: "Client",
};

export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-sm px-4 py-16 text-center sm:px-6">
            <h1 className="text-2xl font-bold text-brand-navy">Mon compte</h1>
            <p className="mt-3 text-sm text-neutral-500">
              Connectez-vous pour accéder à votre compte.
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

  const profile = currentUser.profile;
  const staff = isStaffRole(profile?.role);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
          <h1 className="text-2xl font-bold text-brand-navy">Mon compte</h1>

          <div className="mt-6 rounded-2xl border border-neutral-100 bg-brand-surface p-5">
            <p className="text-sm text-neutral-500">Connecté en tant que</p>
            <p className="mt-1 font-semibold text-brand-navy">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-neutral-500">{currentUser.email}</p>
            {profile?.phone ? (
              <p className="text-sm text-neutral-500">{profile.phone}</p>
            ) : null}
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-orange">
              {ROLE_LABELS[profile?.role ?? "CUSTOMER"]}
            </p>
          </div>

          {staff ? (
            <Link
              href="/admin/orders"
              className="bg-brand-gradient mt-4 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              Accéder au tableau de bord commandes
            </Link>
          ) : (
            <p className="mt-4 text-xs text-neutral-400">
              L&rsquo;historique de vos commandes sera bientôt consultable
              ici.
            </p>
          )}

          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
