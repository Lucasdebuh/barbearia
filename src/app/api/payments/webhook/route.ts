import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment, isMercadoPagoConfigured } from "@/lib/mercadopago";

// Webhook do Mercado Pago: recebe notificações de pagamento e atualiza
// o status de assinaturas e agendamentos no banco de dados.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const topic = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    const paymentIdFromQuery = url.searchParams.get("data.id") ?? url.searchParams.get("id");
    const externalPaymentId = body.data?.id ?? paymentIdFromQuery;

    if (topic !== "payment" || !externalPaymentId || !isMercadoPagoConfigured()) {
      return NextResponse.json({ received: true });
    }

    const mpPaymentData = await mpPayment.get({ id: externalPaymentId });
    const externalReference: string | undefined = mpPaymentData.external_reference ?? undefined;
    const status = mpPaymentData.status; // approved | pending | rejected | ...
    const method = mpPaymentData.payment_type_id ?? undefined;

    if (!externalReference) return NextResponse.json({ received: true });

    const [kind, paymentId] = externalReference.split(":");
    if (!paymentId) return NextResponse.json({ received: true });

    const mappedStatus =
      status === "approved" ? "PAGO" : status === "rejected" ? "FALHOU" : "PENDENTE";

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: mappedStatus,
        method,
        paidAt: mappedStatus === "PAGO" ? new Date() : null,
        rawPayload: mpPaymentData as any,
        externalId: String(mpPaymentData.id ?? externalPaymentId),
      },
      include: { subscription: { include: { plan: true } }, booking: true },
    });

    if (kind === "assinatura" && payment.subscription) {
      if (mappedStatus === "PAGO") {
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + payment.subscription.plan.intervalDays);

        await prisma.subscription.update({
          where: { id: payment.subscription.id },
          data: { status: "ATIVA", startedAt: new Date(), currentPeriodEnd: periodEnd },
        });
        await prisma.barbershop.update({
          where: { id: payment.subscription.barbershopId },
          data: { status: "ATIVA" },
        });
      }
    }

    if (kind === "agendamento" && payment.booking) {
      if (mappedStatus === "PAGO") {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: { paymentStatus: "PAGO", status: "CONFIRMADO" },
        });
      } else if (mappedStatus === "FALHOU") {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: { paymentStatus: "FALHOU" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro no webhook Mercado Pago:", err);
    return NextResponse.json({ received: true });
  }
}
