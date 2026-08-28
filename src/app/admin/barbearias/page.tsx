import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import BarbershopStatusActions from "@/components/admin/BarbershopStatusActions";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  ATIVA: "bg-emerald-400/10 text-emerald-300",
  PENDENTE: "bg-amber-400/10 text-amber-300",
  SUSPENSA: "bg-red-400/10 text-red-300",
};

export default async function AdminBarbershops() {
  const barbershops = await prisma.barbershop.findMany({
    include: { owner: true, subscription: { include: { plan: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Barbearias</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Gerencie o acesso das barbearias cadastradas na plataforma.
      </p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-neutral-400">
                <th className="px-6 py-3 font-medium">Barbearia</th>
                <th className="px-6 py-3 font-medium">Proprietário</th>
                <th className="px-6 py-3 font-medium">Plano</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Cadastro</th>
                <th className="px-6 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {barbershops.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Nenhuma barbearia cadastrada ainda.
                  </td>
                </tr>
              )}
              {barbershops.map((b: any) => (
                <tr key={b.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 font-medium text-white">{b.name}</td>
                  <td className="px-6 py-3 text-neutral-300">{b.owner.name}<br /><span className="text-xs text-neutral-500">{b.owner.email}</span></td>
                  <td className="px-6 py-3 text-neutral-300">{b.subscription?.plan.name ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${statusStyles[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-3 text-neutral-500">{formatDate(b.createdAt)}</td>
                  <td className="px-6 py-3">
                    <BarbershopStatusActions id={b.id} status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
