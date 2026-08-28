import Link from "next/link";
import { Scissors, Instagram, Facebook, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 py-12">
      <div className="container-page grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-ink-950">
              <Scissors size={16} strokeWidth={2.5} />
            </span>
            Barber<span className="text-brand-400">Pro</span>
          </div>
          <p className="mt-3 text-sm text-neutral-400">
            A plataforma completa para gerenciar barbearias, agendamentos e pagamentos online.
          </p>
          <div className="mt-4 flex gap-3 text-neutral-400">
            <Instagram size={18} className="hover:text-white" />
            <Facebook size={18} className="hover:text-white" />
            <Mail size={18} className="hover:text-white" />
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Produto</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="/#recursos" className="hover:text-white">Recursos</Link></li>
            <li><Link href="/#planos" className="hover:text-white">Planos e preços</Link></li>
            <li><Link href="/barbearias" className="hover:text-white">Encontrar barbearia</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Acesso</h4>
          <ul className="space-y-2 text-sm text-neutral-400">
            <li><Link href="/login" className="hover:text-white">Entrar</Link></li>
            <li><Link href="/registro?tipo=barbeiro" className="hover:text-white">Sou barbeiro</Link></li>
            <li><Link href="/registro?tipo=cliente" className="hover:text-white">Sou cliente</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Pagamentos</h4>
          <p className="text-sm text-neutral-400">
            Processado com segurança via Mercado Pago — Pix, cartão de crédito e boleto.
          </p>
        </div>
      </div>

      <div className="container-page mt-10 border-t border-white/5 pt-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} BarberPro. Todos os direitos reservados.
      </div>
    </footer>
  );
}
