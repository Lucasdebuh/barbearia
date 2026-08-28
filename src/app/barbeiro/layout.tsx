import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardShell, { NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, Store, Scissors, Clock, CalendarDays, CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";

const navItems: NavItem[] = [
  { href: "/barbeiro", label: "Visão geral", icon: LayoutDashboard },
  { href: "/barbeiro/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/barbeiro/servicos", label: "Serviços", icon: Scissors },
  { href: "/barbeiro/horarios", label: "Horários", icon: Clock },
  { href: "/barbeiro/perfil", label: "Perfil da barbearia", icon: Store },
  { href: "/barbeiro/assinatura", label: "Assinatura", icon: CreditCard },
];

export default async function BarbeiroLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO") {
    redirect("/login");
  }

  const barbershop = await prisma.barbershop.findUnique({
    where: { ownerId: session.user.id },
  });

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Barbeiro"
      userName={session.user.name}
      badge={
        barbershop?.status !== "ATIVA" ? (
          <span className="badge mt-2 bg-amber-400/10 text-amber-300">Assinatura pendente</span>
        ) : (
          <span className="badge mt-2 bg-emerald-400/10 text-emerald-300">Conta ativa</span>
        )
      }
    >
      {barbershop?.status !== "ATIVA" && (
        <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-200">
          Sua barbearia ainda não está ativa. Escolha um plano e finalize o pagamento em{" "}
          <a href="/barbeiro/assinatura" className="font-semibold underline">
            Assinatura
          </a>{" "}
          para aparecer para clientes e receber agendamentos.
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
