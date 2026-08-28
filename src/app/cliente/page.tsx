import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatBRL } from "@/lib/utils";
import { Search, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClienteHome() {
  const session = await getServerSession(authOptions);

  const [nextBookings, barbershopsCount] = await Promise.all([
    prisma.booking.findMany({
      where: { clientId: session!.user.id, date: { gte: new Date() }, status: { not: "CANCELADO" } },
      include: { service: true, barbershop: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.barbershop.count({ where: { status: "ATIVA" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Olá, {session!.user.name.split(" ")[0]} 👋</h1>
      <p className="mt-1 text-sm text-neutral-400">Encontre uma barbearia e agende seu próximo horário.</p>

      <Link href="/barbearias" className="card mt-6 flex items-center justify-between p-6 transition-colors hover:border-brand-400/40">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300">
            <Search size={20} />
          </span>
          <div>
            <p className="font-semibold text-white">Encontrar barbearia</p>
            <p className="text-sm text-neutral-400">{barbershopsCount} barbearias disponíveis para agendamento</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-neutral-500" />
      </Link>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="font-semibold text-white">Seus próximos agendamentos</h2>
        </div>
        <div className="divide-y divide-white/5">
          {nextBookings.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-neutral-500">Você ainda não tem agendamentos futuros.</p>
          )}
          {nextBookings.map((b: any) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
              <div>
                <p className="font-medium text-white">{b.service.name} — {b.barbershop.name}</p>
                <p className="text-sm text-neutral-400">{formatDateTime(b.date)}</p>
              </div>
              <span className="text-sm font-medium text-neutral-300">{formatBRL(Number(b.price))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
