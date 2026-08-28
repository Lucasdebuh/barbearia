import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  role: z.enum(["BARBEIRO", "CLIENTE"]),
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  phone: z.string().optional(),
  barbershopName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (data.role === "BARBEIRO" && !data.barbershopName) {
      return NextResponse.json(
        { error: "Informe o nome da barbearia" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
      },
    });

    if (data.role === "BARBEIRO" && data.barbershopName) {
      const baseSlug = slugify(data.barbershopName);
      let slug = baseSlug || `barbearia-${user.id.slice(0, 6)}`;
      let count = 1;
      while (await prisma.barbershop.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count++}`;
      }

      await prisma.barbershop.create({
        data: {
          name: data.barbershopName,
          slug,
          ownerId: user.id,
          status: "PENDENTE",
          workingHours: {
            create: Array.from({ length: 7 }).map((_, dayOfWeek) => ({
              dayOfWeek,
              startTime: "09:00",
              endTime: "19:00",
              closed: dayOfWeek === 0,
            })),
          },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
