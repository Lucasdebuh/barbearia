"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function BarbershopStatusActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/admin/barbershops/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 size={14} className="animate-spin text-neutral-400" />}
      {status !== "ATIVA" && (
        <button onClick={() => updateStatus("ATIVA")} className="text-xs font-medium text-emerald-400 hover:underline">
          Ativar
        </button>
      )}
      {status !== "SUSPENSA" && (
        <button onClick={() => updateStatus("SUSPENSA")} className="text-xs font-medium text-red-400 hover:underline">
          Suspender
        </button>
      )}
    </div>
  );
}
