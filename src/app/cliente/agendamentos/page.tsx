import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingsList from "@/components/cliente/BookingsList";

export const dynamic = "force-dynamic";

export default async function AgendamentosPage() {
  const session = await getServerSession(authOptions);
  const bookings = await prisma.booking.findMany({
    where: { clientId: session!.user.id },
    include: { service: true, barbershop: true },
    orderBy: { date: "desc" },
  });

  const serialized = bookings.map((b: any) => ({ ...b, price: Number(b.price), date: b.date.toISOString() }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Meus agendamentos</h1>
      <p className="mt-1 text-sm text-neutral-400">Acompanhe, pague ou cancele seus horários marcados.</p>
      <div className="mt-6">
        <BookingsList bookings={serialized as any} />
      </div>
    </div>
  );
}
