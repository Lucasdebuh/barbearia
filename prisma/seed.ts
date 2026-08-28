import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@barberpro.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador BarberPro",
      email: adminEmail,
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin criado: ${adminEmail} / ${adminPassword}`);

  const plans = [
    {
      name: "Básico",
      price: 49.9,
      description: "Ideal para barbeiros autônomos",
      features: ["1 barbeiro", "Agenda online", "Pagamentos via Pix e cartão"],
      highlighted: false,
    },
    {
      name: "Profissional",
      price: 99.9,
      description: "Para barbearias em crescimento",
      features: ["Até 5 barbeiros", "Agenda online", "Relatórios de receita", "Suporte prioritário"],
      highlighted: true,
    },
    {
      name: "Premium",
      price: 179.9,
      description: "Para redes de barbearias",
      features: ["Barbeiros ilimitados", "Múltiplas unidades", "Relatórios avançados", "Suporte dedicado"],
      highlighted: false,
    },
  ];

  const createdPlans = [];
  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    const created = existing
      ? await prisma.plan.update({ where: { id: existing.id }, data: plan })
      : await prisma.plan.create({ data: plan });
    createdPlans.push(created);
  }
  console.log(`✔ ${createdPlans.length} planos criados`);

  // Barbearia de demonstração já ativa
  const demoBarberEmail = "barbeiro@demo.com";
  const demoBarberPassword = "Demo@123";
  const demoBarberPasswordHash = await bcrypt.hash(demoBarberPassword, 10);

  const demoBarberUser = await prisma.user.upsert({
    where: { email: demoBarberEmail },
    update: {},
    create: {
      name: "Carlos Andrade",
      email: demoBarberEmail,
      password: demoBarberPasswordHash,
      role: "BARBEIRO",
      phone: "(11) 98888-1234",
    },
  });

  let demoBarbershop = await prisma.barbershop.findUnique({ where: { ownerId: demoBarberUser.id } });
  if (!demoBarbershop) {
    demoBarbershop = await prisma.barbershop.create({
      data: {
        name: "Barbearia Vintage",
        slug: "barbearia-vintage",
        description: "Cortes clássicos e modernos em um ambiente acolhedor no coração da cidade.",
        address: "Rua das Palmeiras, 123 - Centro",
        phone: "(11) 98888-1234",
        status: "ATIVA",
        ownerId: demoBarberUser.id,
        workingHours: {
          create: Array.from({ length: 7 }).map((_, dayOfWeek) => ({
            dayOfWeek,
            startTime: "09:00",
            endTime: "19:00",
            closed: dayOfWeek === 0,
          })),
        },
        services: {
          create: [
            { name: "Corte masculino", description: "Corte tradicional na tesoura ou máquina", price: 45, durationMinutes: 30 },
            { name: "Barba", description: "Modelagem completa com toalha quente", price: 35, durationMinutes: 25 },
            { name: "Corte + Barba", description: "Combo completo", price: 70, durationMinutes: 50 },
            { name: "Sobrancelha", description: "Design de sobrancelha na navalha", price: 20, durationMinutes: 15 },
          ],
        },
      },
    });

    await prisma.subscription.create({
      data: {
        barbershopId: demoBarbershop.id,
        planId: createdPlans[1].id,
        status: "ATIVA",
        startedAt: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✔ Barbearia de demonstração: ${demoBarberEmail} / ${demoBarberPassword}`);

  const demoClientEmail = "cliente@demo.com";
  const demoClientPassword = "Demo@123";
  const demoClientPasswordHash = await bcrypt.hash(demoClientPassword, 10);
  await prisma.user.upsert({
    where: { email: demoClientEmail },
    update: {},
    create: {
      name: "João Cliente",
      email: demoClientEmail,
      password: demoClientPasswordHash,
      role: "CLIENTE",
      phone: "(11) 97777-4321",
    },
  });
  console.log(`✔ Cliente de demonstração: ${demoClientEmail} / ${demoClientPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
