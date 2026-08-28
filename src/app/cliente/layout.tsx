import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell, { NavItem } from "@/components/DashboardShell";

const navItems: NavItem[] = [
  { href: "/cliente", label: "Início", icon: "dashboard" },
  { href: "/barbearias", label: "Encontrar barbearia", icon: "busca" },
  { href: "/cliente/agendamentos", label: "Meus agendamentos", icon: "agenda" },
  { href: "/cliente/perfil", label: "Meu perfil", icon: "usuario" },
];

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} roleLabel="Cliente" userName={session.user.name}>
      {children}
    </DashboardShell>
  );
}
