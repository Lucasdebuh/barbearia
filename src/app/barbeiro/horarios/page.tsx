import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HoursManager from "@/components/barbeiro/HoursManager";

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  const session = await getServerSession(authOptions);
  const hours = await prisma.workingHour.findMany({
    where: { barbershopId: session!.user.barbershopId! },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Horários de funcionamento</h1>
      <p className="mt-1 text-sm text-neutral-400">Defina os dias e horários em que sua barbearia recebe agendamentos.</p>
      <div className="mt-6">
        <HoursManager hours={hours} />
      </div>
    </div>
  );
}
