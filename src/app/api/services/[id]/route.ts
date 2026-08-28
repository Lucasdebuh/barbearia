import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service || service.barbershopId !== session.user.barbershopId) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.service.update({
    where: { id: params.id },
    data: {
      name: body.name ?? service.name,
      description: body.description ?? service.description,
      price: body.price ?? service.price,
      durationMinutes: body.durationMinutes ?? service.durationMinutes,
      active: typeof body.active === "boolean" ? body.active : service.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service || service.barbershopId !== session.user.barbershopId) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
