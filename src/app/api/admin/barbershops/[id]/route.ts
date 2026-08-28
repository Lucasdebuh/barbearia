import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { status } = await req.json();
  const allowed = ["PENDENTE", "ATIVA", "SUSPENSA"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await prisma.barbershop.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}
