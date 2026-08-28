"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Calendar, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatBRL } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
};

export default function BookingWidget({ barbershopId, services }: { barbershopId: string; services: Service[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    setError("");

    fetch(`/api/availability?barbershopId=${barbershopId}&date=${date}&duration=${selectedService?.durationMinutes ?? 30}`)
      .then((r) => r.json())
      .then((json) => setSlots(json.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, date, barbershopId, selectedService?.durationMinutes]);

  async function handleBook() {
    if (!selectedSlot || !serviceId) return;

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (session?.user.role !== "CLIENTE") {
      setError("Apenas clientes podem agendar horários. Entre com uma conta de cliente.");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barbershopId, serviceId, date: selectedSlot }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? "Não foi possível agendar. Tente outro horário.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/cliente/agendamentos"), 1200);
  }

  if (services.length === 0) {
    return <p className="text-sm text-neutral-500">Esta barbearia ainda não cadastrou serviços.</p>;
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
        <CheckCircle2 size={18} /> Agendamento realizado! Redirecionando para pagamento...
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-white">Agendar horário</h3>

      <div className="mt-4">
        <label className="label">Serviço</label>
        <select className="input" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatBRL(s.price)} ({s.durationMinutes} min)
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="label flex items-center gap-1">
          <Calendar size={14} /> Data
        </label>
        <input
          type="date"
          className="input"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="label flex items-center gap-1">
          <Clock size={14} /> Horários disponíveis
        </label>
        {loadingSlots ? (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-500">
            <Loader2 size={16} className="animate-spin" /> Carregando horários...
          </div>
        ) : slots.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">Nenhum horário disponível nesta data.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const label = new Date(slot).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const active = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "border-brand-400 bg-brand-400/15 text-brand-300" : "border-white/10 text-neutral-300 hover:border-white/25"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <button onClick={handleBook} disabled={!selectedSlot || submitting} className="btn-primary mt-6 w-full">
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {status === "authenticated" ? "Confirmar agendamento" : "Entrar para agendar"}
      </button>
    </div>
  );
}
