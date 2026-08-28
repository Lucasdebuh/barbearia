"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

type Barbershop = {
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  slug: string;
};

export default function ProfileForm({ barbershop }: { barbershop: Barbershop }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: barbershop.name,
    description: barbershop.description ?? "",
    address: barbershop.address ?? "",
    phone: barbershop.phone ?? "",
    logoUrl: barbershop.logoUrl ?? "",
    coverUrl: barbershop.coverUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/barbershop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <p className="text-sm text-neutral-400">
        Página pública:{" "}
        <a href={`/barbearias/${barbershop.slug}`} className="text-brand-400 hover:underline" target="_blank">
          barberpro.app/barbearias/{barbershop.slug}
        </a>
      </p>

      <div>
        <label className="label">Nome da barbearia</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label">Descrição</label>
        <textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Endereço</label>
          <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className="label">Telefone / WhatsApp</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">URL do logo</label>
          <input className="input" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="label">URL da imagem de capa</label>
          <input className="input" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." />
        </div>
      </div>

      <button disabled={loading} className="btn-primary">
        {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        Salvar alterações
      </button>
    </form>
  );
}
