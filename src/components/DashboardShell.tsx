"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Scissors, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export default function DashboardShell({
  children,
  navItems,
  roleLabel,
  userName,
  badge,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  badge?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6 font-display text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-ink-950">
          <Scissors size={16} strokeWidth={2.5} />
        </span>
        Barber<span className="text-brand-400">Pro</span>
      </div>

      <div className="px-6 pb-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{roleLabel}</p>
        <p className="truncate text-sm font-medium text-white">{userName}</p>
        {badge}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-400/15 text-brand-300"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link href="/" className="mb-1 block rounded-xl px-3 py-2.5 text-sm text-neutral-400 hover:bg-white/5 hover:text-white">
          Ver site público
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-display font-bold">
          <Scissors size={18} className="text-brand-400" /> BarberPro
        </div>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-ink-950 md:hidden">{Sidebar}</div>
      )}

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 md:block">
          {Sidebar}
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
