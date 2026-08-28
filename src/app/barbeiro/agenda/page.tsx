import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AgendaTable from "@/components/barbeiro/AgendaTable";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const session = await getServerSession(authOptions);
  const bookings = await prisma.booking.findMany({
    where: { barbershopId: session!.user.barbershopId! },
    include: { service: true, client: { select: { name: true, phone: true } } },
    orderBy: { date: "asc" },
  });

  const serialized = bookings.map((b: any) => ({ ...b, price: Number(b.price), date: b.date.toISOString() }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Agenda</h1>
      <p className="mt-1 text-sm text-neutral-400">Acompanhe e gerencie todos os agendamentos da sua barbearia.</p>
      <div className="mt-6">
        <AgendaTable bookings={serialized as any} />
      </div>
    </div>
  );
}
