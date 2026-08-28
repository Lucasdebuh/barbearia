"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { formatBRL } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export default function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", durationMinutes: "30" });

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      price: String(s.price),
      durationMinutes: String(s.durationMinutes),
    });
    setOpen(true);
  }

  function resetForm() {
    setForm({ name: "", description: "", price: "", durationMinutes: "30" });
    setEditingId(null);
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      durationMinutes: parseInt(form.durationMinutes, 10),
    };

    if (editingId) {
      await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setLoading(false);
    resetForm();
    router.refresh();
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Remover este serviço?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Serviços</h1>
          <p className="mt-1 text-sm text-neutral-400">Cadastre os serviços oferecidos pela sua barbearia.</p>
        </div>
        <button onClick={() => (open ? resetForm() : setOpen(true))} className="btn-primary">
          <Plus size={16} /> Novo serviço
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label">Nome do serviço</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Corte masculino" />
          </div>
          <div>
            <label className="label">Preço (R$)</label>
            <input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Duração (minutos)</label>
            <input required type="number" min="5" step="5" className="input" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button disabled={loading} className="btn-primary">
              {loading && <Loader2 size={16} className="animate-spin" />} {editingId ? "Salvar alterações" : "Adicionar serviço"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-neutral-400">
              <th className="px-6 py-3 font-medium">Serviço</th>
              <th className="px-6 py-3 font-medium">Preço</th>
              <th className="px-6 py-3 font-medium">Duração</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                  Nenhum serviço cadastrado ainda.
                </td>
              </tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className="border-b border-white/5 last:border-0">
                <td className="px-6 py-3 text-white">
                  {s.name}
                  {s.description && <p className="text-xs text-neutral-500">{s.description}</p>}
                </td>
                <td className="px-6 py-3 text-neutral-300">{formatBRL(s.price)}</td>
                <td className="px-6 py-3 text-neutral-300">{s.durationMinutes} min</td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => toggleActive(s)}
                    className={`badge ${s.active ? "bg-emerald-400/10 text-emerald-300" : "bg-neutral-400/10 text-neutral-400"}`}
                  >
                    {s.active ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => startEdit(s)} className="text-neutral-400 hover:text-white">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(s.id)} className="text-neutral-400 hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
