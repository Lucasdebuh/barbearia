import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/barbeiro/ProfileForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const barbershop = await prisma.barbershop.findUnique({ where: { ownerId: session!.user.id } });
  if (!barbershop) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Perfil da barbearia</h1>
      <p className="mt-1 text-sm text-neutral-400">Essas informações aparecem na página pública para clientes.</p>
      <div className="mt-6">
        <ProfileForm barbershop={barbershop} />
      </div>
    </div>
  );
}
