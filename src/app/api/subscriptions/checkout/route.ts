import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";

// Cria uma preferência de pagamento no Mercado Pago para a barbearia
// assinar/renovar o acesso à plataforma.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "BARBEIRO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { planId } = await req.json();
  if (!planId) {
    return NextResponse.json({ error: "Plano não informado" }, { status: 400 });
  }

  const [plan, barbershop] = await Promise.all([
    prisma.plan.findUnique({ where: { id: planId } }),
    prisma.barbershop.findUnique({ where: { ownerId: session.user.id } }),
  ]);

  if (!plan) return NextResponse.json({ error: "Plano inválido" }, { status: 404 });
  if (!barbershop) return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 });

  const subscription = await prisma.subscription.upsert({
    where: { barbershopId: barbershop.id },
    update: { planId: plan.id, status: "PENDENTE" },
    create: { barbershopId: barbershop.id, planId: plan.id, status: "PENDENTE" },
  });

  const payment = await prisma.payment.create({
    data: {
      type: "ASSINATURA",
      amount: plan.price,
      status: "PENDENTE",
      subscriptionId: subscription.id,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!isMercadoPagoConfigured()) {
    // Ambiente de demonstração sem chaves reais do Mercado Pago configuradas.
    return NextResponse.json({
      demo: true,
      message:
        "MERCADOPAGO_ACCESS_TOKEN não configurado. Configure as variáveis de ambiente para ativar pagamentos reais.",
      paymentId: payment.id,
    });
  }

  const preference = await mpPreference.create({
    body: {
      items: [
        {
          id: plan.id,
          title: `Assinatura BarberPro — Plano ${plan.name}`,
          quantity: 1,
          unit_price: Number(plan.price),
          currency_id: "BRL",
        },
      ],
      payer: { email: session.user.email },
      back_urls: {
        success: `${appUrl}/barbeiro/assinatura?status=sucesso`,
        pending: `${appUrl}/barbeiro/assinatura?status=pendente`,
        failure: `${appUrl}/barbeiro/assinatura?status=erro`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/payments/webhook`,
      external_reference: `assinatura:${payment.id}`,
      metadata: { paymentId: payment.id, type: "ASSINATURA" },
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { externalId: preference.id },
  });

  return NextResponse.json({
    init_point: preference.init_point,
    sandbox_init_point: preference.sandbox_init_point,
  });
}
