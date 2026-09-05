import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaffRole } from "@/services/auth.service";
import { SignOutButton } from "@/components/SignOutButton";

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
            <Link href="/admin/orders" className="text-lg font-bold text-brand-navy">
              SENDUU <span className="text-brand-orange">Admin</span>
            </Link>
            <p className="text-xs text-neutral-400">
              Connecté en tant que {currentUser.profile?.first_name}{" "}
              {currentUser.profile?.last_name}
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
