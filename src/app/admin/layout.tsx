import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell, { NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, Store, CreditCard, Tag } from "lucide-react";

const navItems: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/barbearias", label: "Barbearias", icon: Store },
  { href: "/admin/planos", label: "Planos", icon: Tag },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} roleLabel="Administrador" userName={session.user.name}>
      {children}
    </DashboardShell>
  );
}
