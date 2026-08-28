import { prisma } from "@/lib/prisma";
import { formatBRL, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PAGO: "bg-emerald-400/10 text-emerald-300",
  PENDENTE: "bg-amber-400/10 text-amber-300",
  FALHOU: "bg-red-400/10 text-red-300",
  REEMBOLSADO: "bg-neutral-400/10 text-neutral-300",
};

export default async function AdminPayments() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscription: { include: { barbershop: true } },
      booking: { include: { barbershop: true, client: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Pagamentos</h1>
      <p className="mt-1 text-sm text-neutral-400">Histórico de pagamentos processados via Mercado Pago.</p>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-neutral-400">
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Origem</th>
                <th className="px-6 py-3 font-medium">Método</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              )}
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-3 text-neutral-300">{p.type === "ASSINATURA" ? "Assinatura" : "Agendamento"}</td>
                  <td className="px-6 py-3 text-neutral-300">
                    {p.subscription?.barbershop.name ?? p.booking?.barbershop?.name ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-neutral-500">{p.method ?? "—"}</td>
                  <td className="px-6 py-3 font-medium text-white">{formatBRL(Number(p.amount))}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${statusStyles[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-3 text-neutral-500">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
