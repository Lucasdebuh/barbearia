import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-white/5", accent)}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
