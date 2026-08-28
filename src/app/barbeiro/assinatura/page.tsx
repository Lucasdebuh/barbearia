import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubscriptionPlans from "@/components/barbeiro/SubscriptionPlans";

export const dynamic = "force-dynamic";

export default async function AssinaturaPage() {
  const session = await getServerSession(authOptions);
  const [plans, barbershop] = await Promise.all([
    prisma.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.barbershop.findUnique({
      where: { ownerId: session!.user.id },
      include: { subscription: { include: { plan: true } } },
    }),
  ]);

  const serializedPlans = plans.map((p: any) => ({ ...p, price: Number(p.price) }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Assinatura</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Escolha um plano para ativar sua barbearia na plataforma e começar a receber agendamentos.
      </p>

      {barbershop?.subscription && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm text-neutral-400">Plano atual</p>
            <p className="text-lg font-semibold text-white">{barbershop.subscription.plan.name}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">Status</p>
            <p className="text-lg font-semibold text-white">{barbershop.subscription.status}</p>
          </div>
          {barbershop.subscription.currentPeriodEnd && (
            <div>
              <p className="text-sm text-neutral-400">Válido até</p>
              <p className="text-lg font-semibold text-white">
                {new Date(barbershop.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <SubscriptionPlans plans={serializedPlans as any} currentPlanId={barbershop?.subscription?.planId} />
      </div>
    </div>
  );
}
