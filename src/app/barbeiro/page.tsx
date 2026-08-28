import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import { formatBRL, formatDateTime } from "@/lib/utils";
import { CalendarDays, DollarSign, Users, Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarbeiroHome() {
  const session = await getServerSession(authOptions);
  const barbershop = await prisma.barbershop.findUnique({
    where: { ownerId: session!.user.id },
  });

  if (!barbershop) return null;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [todayBookings, upcomingBookings, revenueAgg, servicesCount] = await Promise.all([
    prisma.booking.count({
      where: { barbershopId: barbershop.id, date: { gte: startOfDay, lte: endOfDay }, status: { not: "CANCELADO" } },
    }),
    prisma.booking.findMany({
      where: { barbershopId: barbershop.id, date: { gte: new Date() }, status: { not: "CANCELADO" } },
      include: { service: true, client: true },
      orderBy: { date: "asc" },
      take: 6,
    }),
    prisma.booking.aggregate({
      where: { barbershopId: barbershop.id, paymentStatus: "PAGO" },
      _sum: { price: true },
    }),
    prisma.service.count({ where: { barbershopId: barbershop.id, active: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Olá, {session!.user.name.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-sm text-neutral-400">Aqui está um resumo da {barbershop.name}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Agendamentos hoje" value={String(todayBookings)} icon={CalendarDays} accent="text-brand-300" />
        <StatCard label="Receita total recebida" value={formatBRL(Number(revenueAgg._sum.price ?? 0))} icon={DollarSign} accent="text-emerald-300" />
        <StatCard label="Serviços ativos" value={String(servicesCount)} icon={Scissors} accent="text-blue-300" />
        <StatCard label="Status da barbearia" value={barbershop.status} icon={Users} accent="text-amber-300" />
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Próximos agendamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-neutral-400">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Serviço</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Nenhum agendamento futuro.
                  </td>
                </tr>
              )}
              {upcomingBookings.map((b: any) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 text-white">{b.client.name}</td>
                  <td className="px-6 py-3 text-neutral-300">{b.service.name}</td>
                  <td className="px-6 py-3 text-neutral-400">{formatDateTime(b.date)}</td>
                  <td className="px-6 py-3 text-neutral-400">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
