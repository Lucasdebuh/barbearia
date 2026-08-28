import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const plan = await prisma.plan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

  const updated = await prisma.plan.update({
    where: { id: params.id },
    data: {
      name: body.name ?? plan.name,
      price: body.price ?? plan.price,
      intervalDays: body.intervalDays ?? plan.intervalDays,
      description: body.description ?? plan.description,
      features: body.features ?? plan.features,
      highlighted: typeof body.highlighted === "boolean" ? body.highlighted : plan.highlighted,
      active: typeof body.active === "boolean" ? body.active : plan.active,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.plan.update({ where: { id: params.id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
