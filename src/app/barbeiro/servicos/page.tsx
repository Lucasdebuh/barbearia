import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ServicesManager from "@/components/barbeiro/ServicesManager";

export const dynamic = "force-dynamic";

export default async function ServicosPage() {
  const session = await getServerSession(authOptions);
  const services = await prisma.service.findMany({
    where: { barbershopId: session!.user.barbershopId! },
    orderBy: { createdAt: "desc" },
  });
  const serialized = services.map((s: any) => ({ ...s, price: Number(s.price) }));
  return <ServicesManager services={serialized as any} />;
}
