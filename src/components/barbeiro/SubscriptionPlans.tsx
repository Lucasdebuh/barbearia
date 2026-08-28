"use client";

import { useState } from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { formatBRL, cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
  highlighted: boolean;
};

export default function SubscriptionPlans({ plans, currentPlanId }: { plans: Plan[]; currentPlanId?: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function subscribe(planId: string) {
    setLoadingId(planId);
    setNotice("");
    const res = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
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

  return (
    <div>
      {notice && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {notice}
        </div>
      )}

      {plans.length === 0 ? (
        <p className="text-neutral-400">Nenhum plano disponível no momento. Fale com o administrador da plataforma.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "card flex flex-col p-6",
                plan.highlighted && "border-brand-400/50 shadow-glow",
                currentPlanId === plan.id && "ring-2 ring-brand-400"
              )}
            >
              <h3 className="font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-neutral-400">{plan.description}</p>
              <p className="mt-4 font-display text-3xl font-bold text-white">
                {formatBRL(plan.price)} <span className="text-sm font-normal text-neutral-500">/mês</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-brand-400" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(plan.id)}
                disabled={loadingId === plan.id}
                className={currentPlanId === plan.id ? "btn-secondary mt-6" : "btn-primary mt-6"}
              >
                {loadingId === plan.id && <Loader2 size={16} className="animate-spin" />}
                {currentPlanId === plan.id ? "Renovar / trocar" : "Assinar com Pix, cartão ou boleto"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
