import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell, { NavItem } from "@/components/DashboardShell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: "dashboard" },
  { href: "/admin/barbearias", label: "Barbearias", icon: "loja" },
  { href: "/admin/planos", label: "Planos", icon: "tag" },
  { href: "/admin/pagamentos", label: "Pagamentos", icon: "pagamento" },
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
