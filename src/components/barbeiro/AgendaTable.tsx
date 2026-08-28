"use client";

import { useRouter } from "next/navigation";
import { formatDateTime, formatBRL } from "@/lib/utils";

type Booking = {
  id: string;
  date: string;
  status: string;
  paymentStatus: string;
  price: number;
  service: { name: string };
  client: { name: string; phone: string | null };
};

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-400/10 text-amber-300",
  CONFIRMADO: "bg-blue-400/10 text-blue-300",
  CONCLUIDO: "bg-emerald-400/10 text-emerald-300",
  CANCELADO: "bg-red-400/10 text-red-300",
};

export default function AgendaTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-neutral-400">
              <th className="px-6 py-3 font-medium">Cliente</th>
              <th className="px-6 py-3 font-medium">Serviço</th>
              <th className="px-6 py-3 font-medium">Data</th>
              <th className="px-6 py-3 font-medium">Valor</th>
              <th className="px-6 py-3 font-medium">Pagamento</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                  Nenhum agendamento por aqui.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 last:border-0">
                <td className="px-6 py-3 text-white">
                  {b.client.name}
                  {b.client.phone && <p className="text-xs text-neutral-500">{b.client.phone}</p>}
                </td>
                <td className="px-6 py-3 text-neutral-300">{b.service.name}</td>
                <td className="px-6 py-3 text-neutral-400">{formatDateTime(b.date)}</td>
                <td className="px-6 py-3 text-neutral-300">{formatBRL(b.price)}</td>
                <td className="px-6 py-3">
                  <span className={`badge ${b.paymentStatus === "PAGO" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                    {b.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`badge ${statusStyles[b.status]}`}>{b.status}</span>
                </td>
                <td className="px-6 py-3">
                  <select
                    className="input py-1 text-xs"
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
