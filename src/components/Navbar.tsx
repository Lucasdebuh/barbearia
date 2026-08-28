import Link from "next/link";
import { Scissors } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-ink-950">
            <Scissors size={18} strokeWidth={2.5} />
          </span>
          Barber<span className="text-brand-400">Pro</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-neutral-300 md:flex">
          <Link href="/#recursos" className="hover:text-white">Recursos</Link>
          <Link href="/#planos" className="hover:text-white">Planos</Link>
          <Link href="/barbearias" className="hover:text-white">Encontrar barbearia</Link>
          <Link href="/#como-funciona" className="hover:text-white">Como funciona</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <Link href="/registro" className="btn-primary">Criar conta</Link>
        </div>
      </nav>
    </header>
  );
}
