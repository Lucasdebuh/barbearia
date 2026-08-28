"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { WEEKDAYS } from "@/lib/utils";

type Hour = { dayOfWeek: number; startTime: string; endTime: string; closed: boolean };

export default function HoursManager({ hours }: { hours: Hour[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Hour[]>(
    Array.from({ length: 7 }).map((_, i) => hours.find((h) => h.dayOfWeek === i) ?? { dayOfWeek: i, startTime: "09:00", endTime: "19:00", closed: i === 0 })
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(day: number, patch: Partial<Hour>) {
    setRows((prev) => prev.map((r) => (r.dayOfWeek === day ? { ...r, ...patch } : r)));
  }

  async function save() {
    setLoading(true);
    setSaved(false);
    await fetch("/api/barbershop/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours: rows }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.dayOfWeek} className="flex flex-wrap items-center gap-4 border-b border-white/5 pb-3 last:border-0">
            <div className="w-36 text-sm font-medium text-white">{WEEKDAYS[r.dayOfWeek]}</div>
            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <input type="checkbox" checked={!r.closed} onChange={(e) => update(r.dayOfWeek, { closed: !e.target.checked })} />
              Aberto
            </label>
            {!r.closed && (
              <>
                <input type="time" className="input w-32" value={r.startTime} onChange={(e) => update(r.dayOfWeek, { startTime: e.target.value })} />
                <span className="text-neutral-500">até</span>
                <input type="time" className="input w-32" value={r.endTime} onChange={(e) => update(r.dayOfWeek, { endTime: e.target.value })} />
              </>
            )}
          </div>
        ))}
      </div>

      <button onClick={save} disabled={loading} className="btn-primary mt-6">
        {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
        Salvar horários
      </button>
    </div>
  );
}
