import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell, { NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, Search, CalendarDays, UserRound } from "lucide-react";

const navItems: NavItem[] = [
  { href: "/cliente", label: "Início", icon: LayoutDashboard },
  { href: "/barbearias", label: "Encontrar barbearia", icon: Search },
  { href: "/cliente/agendamentos", label: "Meus agendamentos", icon: CalendarDays },
  { href: "/cliente/perfil", label: "Meu perfil", icon: UserRound },
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
