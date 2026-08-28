"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatBRL } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  price: number;
  intervalDays: number;
  description: string | null;
  features: string[];
  highlighted: boolean;
  active: boolean;
};

export default function PlansManager({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", description: "", features: "" });
  const [open, setOpen] = useState(false);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      }),
    });
    setLoading(false);
    setForm({ name: "", price: "", description: "", features: "" });
    setOpen(false);
    router.refresh();
  }

  async function removePlan(id: string) {
    if (!confirm("Desativar este plano?")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Planos</h1>
          <p className="mt-1 text-sm text-neutral-400">Defina os planos de assinatura vendidos às barbearias.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="btn-primary">
          <Plus size={16} /> Novo plano
        </button>
      </div>

      {open && (
        <form onSubmit={createPlan} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label">Nome do plano</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Preço mensal (R$)</label>
            <input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Recursos (um por linha)</label>
            <textarea rows={3} className="input" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button disabled={loading} className="btn-primary">
              {loading && <Loader2 size={16} className="animate-spin" />} Salvar plano
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`card p-6 ${!p.active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-white">{p.name}</h3>
              <button onClick={() => removePlan(p.id)} className="text-neutral-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-neutral-400">{p.description}</p>
            <p className="mt-4 font-display text-2xl font-bold text-white">
              {formatBRL(p.price)} <span className="text-sm font-normal text-neutral-500">/mês</span>
            </p>
            <ul className="mt-4 space-y-1 text-sm text-neutral-300">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            {!p.active && <p className="mt-3 text-xs text-red-400">Plano inativo</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
