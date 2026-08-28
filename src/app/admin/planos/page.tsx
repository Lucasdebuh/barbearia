import { prisma } from "@/lib/prisma";
import PlansManager from "@/components/admin/PlansManager";

export const dynamic = "force-dynamic";

export default async function AdminPlans() {
  const plans = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  const serialized = plans.map((p: any) => ({ ...p, price: Number(p.price) }));
  return <PlansManager plans={serialized as any} />;
}
