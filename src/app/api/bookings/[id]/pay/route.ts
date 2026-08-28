import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";

// Cria uma preferência de pagamento no Mercado Pago para o cliente pagar
// pelo serviço agendado (Pix, cartão ou boleto).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CLIENTE") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { service: true, barbershop: true, payment: true },
  });

  if (!booking || booking.clientId !== session.user.id) {
    return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
  }

  if (booking.paymentStatus === "PAGO") {
    return NextResponse.json({ error: "Este agendamento já foi pago" }, { status: 400 });
  }

  const payment =
    booking.payment ??
    (await prisma.payment.create({
      data: {
        type: "AGENDAMENTO",
        amount: booking.price,
        status: "PENDENTE",
        bookingId: booking.id,
      },
    }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!isMercadoPagoConfigured()) {
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
          id: booking.service.id,
          title: `${booking.service.name} — ${booking.barbershop.name}`,
          quantity: 1,
          unit_price: Number(booking.price),
          currency_id: "BRL",
        },
      ],
      payer: { email: session.user.email },
      back_urls: {
        success: `${appUrl}/cliente/agendamentos?status=sucesso`,
        pending: `${appUrl}/cliente/agendamentos?status=pendente`,
        failure: `${appUrl}/cliente/agendamentos?status=erro`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/payments/webhook`,
      external_reference: `agendamento:${payment.id}`,
      metadata: { paymentId: payment.id, type: "AGENDAMENTO" },
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
