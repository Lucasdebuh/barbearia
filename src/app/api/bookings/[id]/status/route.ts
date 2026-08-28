import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  const { status } = await req.json();
  const allowed = ["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  if (session.user.role === "BARBEIRO") {
    if (booking.barbershopId !== session.user.barbershopId) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }
  } else if (session.user.role === "CLIENTE") {
    if (booking.clientId !== session.user.id || status !== "CANCELADO") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
