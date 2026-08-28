import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  intervalDays: z.number().int().positive().default(30),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  highlighted: z.boolean().default(false),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = schema.parse(await req.json());
    const plan = await prisma.plan.create({ data });
    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json({ error: err.issues?.[0]?.message ?? "Dados inválidos" }, { status: 400 });
  }
}
