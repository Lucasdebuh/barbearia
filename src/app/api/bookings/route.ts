import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  barbershopId: z.string(),
  serviceId: z.string(),
  date: z.string(), // ISO
  notes: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  if (session.user.role === "CLIENTE") {
    const bookings = await prisma.booking.findMany({
      where: { clientId: session.user.id },
      include: { service: true, barbershop: true, payment: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(bookings);
  }

  if (session.user.role === "BARBEIRO" && session.user.barbershopId) {
    const bookings = await prisma.booking.findMany({
      where: { barbershopId: session.user.barbershopId },
      include: { service: true, client: { select: { name: true, phone: true, email: true } } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(bookings);
  }

  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());

    const [service, barbershop] = await Promise.all([
      prisma.service.findUnique({ where: { id: data.serviceId } }),
      prisma.barbershop.findUnique({ where: { id: data.barbershopId } }),
    ]);

    if (!service || !barbershop || barbershop.status !== "ATIVA") {
      return NextResponse.json({ error: "Barbearia ou serviço indisponível" }, { status: 400 });
    }

    const date = new Date(data.date);

    const conflict = await prisma.booking.findFirst({
      where: {
        barbershopId: data.barbershopId,
        status: { not: "CANCELADO" },
        date,
      },
    });
    if (conflict) {
      return NextResponse.json({ error: "Este horário acabou de ser reservado. Escolha outro." }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        barbershopId: data.barbershopId,
        serviceId: data.serviceId,
        clientId: session.user.id,
        date,
        price: service.price,
        notes: data.notes,
      },
    });

    return NextResponse.json(booking);
  } catch (err: any) {
    return NextResponse.json({ error: err.issues?.[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
}
