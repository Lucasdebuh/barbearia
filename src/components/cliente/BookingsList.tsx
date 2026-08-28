"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { formatDateTime, formatBRL } from "@/lib/utils";

type Booking = {
  id: string;
  date: string;
  status: string;
  paymentStatus: string;
  price: number;
  service: { name: string };
  barbershop: { name: string; phone: string | null };
};

const statusStyles: Record<string, string> = {
  PENDENTE: "bg-amber-400/10 text-amber-300",
  CONFIRMADO: "bg-blue-400/10 text-blue-300",
  CONCLUIDO: "bg-emerald-400/10 text-emerald-300",
  CANCELADO: "bg-red-400/10 text-red-300",
};

export default function BookingsList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function pay(id: string) {
    setLoadingId(id);
    setNotice("");
    const res = await fetch(`/api/bookings/${id}/pay`, { method: "POST" });
    const json = await res.json();
    setLoadingId(null);

    if (json.demo) {
      setNotice(json.message);
      return;
    }
    if (json.init_point) {
      window.location.href = json.init_point;
    } else {
      setNotice(json.error ?? "Não foi possível iniciar o pagamento.");
    }
  }

  async function cancel(id: string) {
    if (!confirm("Cancelar este agendamento?")) return;
    await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELADO" }),
    }).catch(() => {});
    router.refresh();
  }

  return (
    <div>
      {notice && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {notice}
        </div>
      )}
      <div className="space-y-3">
        {bookings.length === 0 && (
          <p className="card px-6 py-8 text-center text-sm text-neutral-500">Você ainda não tem agendamentos.</p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="font-medium text-white">{b.service.name} — {b.barbershop.name}</p>
              <p className="text-sm text-neutral-400">{formatDateTime(b.date)}</p>
              <div className="mt-2 flex gap-2">
                <span className={`badge ${statusStyles[b.status]}`}>{b.status}</span>
                <span className={`badge ${b.paymentStatus === "PAGO" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}>
                  {b.paymentStatus === "PAGO" ? "Pago" : "Pagamento pendente"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">{formatBRL(b.price)}</span>
              {b.paymentStatus !== "PAGO" && b.status !== "CANCELADO" && (
                <button onClick={() => pay(b.id)} disabled={loadingId === b.id} className="btn-primary text-xs">
                  {loadingId === b.id && <Loader2 size={14} className="animate-spin" />} Pagar agora
                </button>
              )}
              {b.status !== "CANCELADO" && b.status !== "CONCLUIDO" && (
                <button onClick={() => cancel(b.id)} className="btn-secondary text-xs">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
