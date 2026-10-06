import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaffRole } from "@/services/auth.service";
import { SignOutButton } from "@/components/SignOutButton";
import { can, type Permission } from "@/config/permissions";

const NAV_ITEMS: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin", label: "Tableau de bord", permission: "dashboard.view" },
  { href: "/admin/orders", label: "Commandes", permission: "orders.manage" },
  { href: "/admin/categories", label: "Catégories", permission: "catalog.manage" },
  { href: "/admin/products", label: "Produits", permission: "catalog.manage" },
  { href: "/admin/coupons", label: "Codes promo", permission: "catalog.manage" },
  { href: "/admin/suppliers", label: "Fournisseurs", permission: "suppliers.manage" },
  { href: "/admin/reviews", label: "Avis", permission: "reviews.moderate" },
  { href: "/admin/fulfillment", label: "Dropshipping", permission: "fulfillment.manage" },
  { href: "/admin/team", label: "Équipe", permission: "team.manage" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }
  if (!isStaffRole(currentUser.profile?.role)) {
    redirect("/account");
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link href="/admin" className="text-lg font-bold text-brand-navy">
              SENDUU <span className="text-brand-orange">Admin</span>
            </Link>
            <p className="text-xs text-neutral-400">
              Connecté en tant que {currentUser.profile?.first_name}{" "}
              {currentUser.profile?.last_name}
            </p>
          </div>
          <SignOutButton />
        </div>
        <nav className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <ul className="flex gap-4 text-sm font-medium text-neutral-500">
            {NAV_ITEMS.filter((item) => can(currentUser.profile?.role, item.permission)).map(
              (item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-brand-navy">
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
