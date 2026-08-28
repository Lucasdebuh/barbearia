import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import { formatBRL, formatDateTime } from "@/lib/utils";
import { Store, Users, CreditCard, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [totalBarbershops, activeBarbershops, pendingBarbershops, totalClients, payments] =
    await Promise.all([
      prisma.barbershop.count(),
      prisma.barbershop.count({ where: { status: "ATIVA" } }),
      prisma.barbershop.count({ where: { status: "PENDENTE" } }),
      prisma.user.count({ where: { role: "CLIENTE" } }),
      prisma.payment.findMany({
        where: { status: "PAGO" },
        orderBy: { paidAt: "desc" },
        take: 10,
        include: { subscription: { include: { barbershop: true } }, booking: { include: { barbershop: true } } },
      }),
    ]);

  const revenueAgg = await prisma.payment.aggregate({
    where: { status: "PAGO", type: "ASSINATURA" },
    _sum: { amount: true },
  });
  const bookingRevenueAgg = await prisma.payment.aggregate({
    where: { status: "PAGO", type: "AGENDAMENTO" },
    _sum: { amount: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Visão geral</h1>
      <p className="mt-1 text-sm text-neutral-400">Acompanhe a saúde da plataforma BarberPro.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Barbearias ativas" value={String(activeBarbershops)} hint={`${totalBarbershops} cadastradas no total`} icon={Store} accent="text-brand-300" />
        <StatCard label="Aguardando pagamento" value={String(pendingBarbershops)} hint="Assinatura pendente" icon={CreditCard} accent="text-amber-300" />
        <StatCard label="Clientes cadastrados" value={String(totalClients)} icon={Users} accent="text-blue-300" />
        <StatCard
          label="Receita de assinaturas"
          value={formatBRL(Number(revenueAgg._sum.amount ?? 0))}
          hint={`+ ${formatBRL(Number(bookingRevenueAgg._sum.amount ?? 0))} em agendamentos`}
          icon={TrendingUp}
          accent="text-emerald-300"
        />
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Últimos pagamentos aprovados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-neutral-400">
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Origem</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Nenhum pagamento aprovado ainda.
                  </td>
                </tr>
              )}
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 text-neutral-300">
                    {p.type === "ASSINATURA" ? "Assinatura" : "Agendamento"}
                  </td>
                  <td className="px-6 py-3 text-neutral-300">
                    {p.subscription?.barbershop.name ?? p.booking?.barbershop?.name ?? "—"}
                  </td>
                  <td className="px-6 py-3 font-medium text-white">{formatBRL(Number(p.amount))}</td>
                  <td className="px-6 py-3 text-neutral-500">{p.paidAt ? formatDateTime(p.paidAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
