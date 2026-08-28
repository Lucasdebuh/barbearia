import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { hours } = await req.json();
  const barbershopId = session.user.barbershopId;

  await Promise.all(
    hours.map((h: any) =>
      prisma.workingHour.upsert({
        where: { barbershopId_dayOfWeek: { barbershopId, dayOfWeek: h.dayOfWeek } },
        update: { startTime: h.startTime, endTime: h.endTime, closed: h.closed },
        create: {
          barbershopId,
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
          closed: h.closed,
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
