import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const services = await prisma.service.findMany({
    where: { barbershopId: session.user.barbershopId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO" || !session.user.barbershopId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const data = schema.parse(await req.json());
    const service = await prisma.service.create({
      data: { ...data, barbershopId: session.user.barbershopId },
    });
    return NextResponse.json(service);
  } catch (err: any) {
    return NextResponse.json({ error: err.issues?.[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
}
