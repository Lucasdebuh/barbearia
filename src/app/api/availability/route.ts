import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Retorna os horários disponíveis de uma barbearia em uma data específica,
// considerando o horário de funcionamento e agendamentos já existentes.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const barbershopId = searchParams.get("barbershopId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const durationMinutes = parseInt(searchParams.get("duration") ?? "30", 10);

  if (!barbershopId || !dateStr) {
    return NextResponse.json({ error: "Parâmetros ausentes" }, { status: 400 });
  }

  const date = new Date(`${dateStr}T00:00:00`);
  const dayOfWeek = date.getDay();

  const workingHour = await prisma.workingHour.findUnique({
    where: { barbershopId_dayOfWeek: { barbershopId, dayOfWeek } },
  });

  if (!workingHour || workingHour.closed) {
    return NextResponse.json({ slots: [] });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      barbershopId,
      status: { not: "CANCELADO" },
      date: {
        gte: new Date(`${dateStr}T00:00:00`),
        lt: new Date(`${dateStr}T23:59:59`),
      },
    },
    select: { date: true },
  });

  const bookedTimes = new Set(bookings.map((b: any) => b.date.toISOString()));

  const [startH, startM] = workingHour.startTime.split(":").map(Number);
  const [endH, endM] = workingHour.endTime.split(":").map(Number);

  const slots: string[] = [];
  const cursor = new Date(date);
  cursor.setHours(startH, startM, 0, 0);
  const end = new Date(date);
  end.setHours(endH, endM, 0, 0);

  const now = new Date();

  while (cursor.getTime() + durationMinutes * 60000 <= end.getTime()) {
    if (!bookedTimes.has(cursor.toISOString()) && cursor.getTime() > now.getTime()) {
      slots.push(cursor.toISOString());
    }
    cursor.setMinutes(cursor.getMinutes() + durationMinutes);
  }

  return NextResponse.json({ slots });
}
