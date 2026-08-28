"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

export default function ClienteProfileForm({ name, phone, email }: { name: string; phone: string | null; email: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ name, phone: phone ?? "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/me", {
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
      <div>
        <label className="label">Nome</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input opacity-60" value={email} disabled />
      </div>
      <div>
        <label className="label">Telefone / WhatsApp</label>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <button disabled={loading} className="btn-primary">
        {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        Salvar
      </button>
    </form>
  );
}
