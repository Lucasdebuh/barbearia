import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const updated = await prisma.barbershop.update({
    where: { id: session.user.barbershopId },
    data: {
      name: body.name,
      description: body.description,
      address: body.address,
      phone: body.phone,
      logoUrl: body.logoUrl,
      coverUrl: body.coverUrl,
    },
  });
  return NextResponse.json(updated);
}
