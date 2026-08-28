import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClienteProfileForm from "@/components/cliente/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ClientePerfilPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Meu perfil</h1>
      <p className="mt-1 text-sm text-neutral-400">Mantenha seus dados atualizados.</p>
      <div className="mt-6">
        <ClienteProfileForm name={user.name} phone={user.phone} email={user.email} />
      </div>
    </div>
  );
}
