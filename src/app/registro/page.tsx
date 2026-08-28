"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scissors, Loader2, AlertCircle, Scissors as BarberIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTipo = params.get("tipo") === "barbeiro" ? "BARBEIRO" : params.get("tipo") === "cliente" ? "CLIENTE" : "CLIENTE";

  const [role, setRole] = useState<"BARBEIRO" | "CLIENTE">(initialTipo as any);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [barbershopName, setBarbershopName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name, email, phone, password, barbershopName }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Erro ao criar conta");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      if (role === "BARBEIRO") {
        router.push("/barbeiro/assinatura");
      } else {
        router.push("/cliente");
      }
      router.refresh();
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-ink-950">
            <Scissors size={18} strokeWidth={2.5} />
          </span>
          Barber<span className="text-brand-400">Pro</span>
        </Link>

        <div className="card p-8">
          <h1 className="mb-1 text-2xl font-bold text-white">Criar conta</h1>
          <p className="mb-6 text-sm text-neutral-400">Escolha o tipo de conta para começar.</p>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setRole("CLIENTE")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                role === "CLIENTE" ? "bg-brand-400 text-ink-950" : "text-neutral-400 hover:text-white"
              )}
            >
              <User size={16} /> Sou cliente
            </button>
            <button
              type="button"
              onClick={() => setRole("BARBEIRO")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                role === "BARBEIRO" ? "bg-brand-400 text-ink-950" : "text-neutral-400 hover:text-white"
              )}
            >
              <BarberIcon size={16} /> Sou barbeiro
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input required className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>

            {role === "BARBEIRO" && (
              <div>
                <label className="label">Nome da barbearia</label>
                <input
                  required
                  className="input"
                  value={barbershopName}
                  onChange={(e) => setBarbershopName(e.target.value)}
                  placeholder="Ex: Barbearia Vintage"
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
            </div>

            <div>
              <label className="label">Telefone (WhatsApp)</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {role === "BARBEIRO" ? "Criar conta e assinar plano" : "Criar conta"}
            </button>
          </form>

          {role === "BARBEIRO" && (
            <p className="mt-4 text-center text-xs text-neutral-500">
              Após o cadastro você escolherá um plano e pagará via Pix, cartão ou boleto para ativar sua barbearia.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-neutral-400">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-brand-400 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
