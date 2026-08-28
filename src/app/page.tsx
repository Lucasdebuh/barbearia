import Link from "next/link";
import {
  Scissors,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Smartphone,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getPlans() {
  try {
    return await prisma.plan.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const plans = await getPlans();

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-ink-950 to-ink-950" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />

        <div className="container-page relative flex flex-col items-center gap-8 py-24 text-center md:py-36">
          <span className="badge border border-brand-400/30 bg-brand-400/10 text-brand-300">
            <Star size={12} className="fill-brand-300 text-brand-300" />
            Feito para barbearias modernas
          </span>

          <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Gerencie sua barbearia, agende clientes e{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-200 bg-clip-text text-transparent">
              receba pagamentos
            </span>{" "}
            em um só lugar
          </h1>

          <p className="max-w-2xl text-lg text-neutral-400">
            Plataforma completa com painel administrativo, login para barbeiros e para clientes.
            Assinatura de acesso, agendamento online e pagamentos via Pix, cartão e boleto com Mercado Pago.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/registro?tipo=barbeiro" className="btn-primary px-7 py-3 text-base">
              Cadastrar minha barbearia <ArrowRight size={18} />
            </Link>
            <Link href="/registro?tipo=cliente" className="btn-secondary px-7 py-3 text-base">
              Sou cliente, quero agendar
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-500">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-400" /> Pagamentos seguros</span>
            <span className="flex items-center gap-2"><Smartphone size={16} className="text-brand-400" /> 100% responsivo</span>
            <span className="flex items-center gap-2"><CalendarCheck size={16} className="text-brand-400" /> Agenda em tempo real</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="border-t border-white/5 py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Tudo que sua barbearia precisa
            </h2>
            <p className="mt-3 text-neutral-400">
              Três painéis dedicados — administrador, barbeiro e cliente — cada um com as ferramentas certas.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Painel administrativo",
                desc: "Venda acesso à plataforma, gerencie assinaturas de barbearias, planos e acompanhe a receita da plataforma.",
              },
              {
                icon: Scissors,
                title: "Painel do barbeiro",
                desc: "Cadastre serviços, horários de funcionamento, acompanhe sua agenda e seus ganhos em tempo real.",
              },
              {
                icon: CalendarCheck,
                title: "Agendamento online",
                desc: "Clientes escolhem barbearia, serviço e horário disponível, sem precisar ligar ou trocar mensagens.",
              },
              {
                icon: CreditCard,
                title: "Pagamentos integrados",
                desc: "Receba com Pix, cartão de crédito e boleto via Mercado Pago — pagamento de assinatura e de agendamentos.",
              },
              {
                icon: BarChart3,
                title: "Relatórios e métricas",
                desc: "Visualize receita, número de agendamentos, ticket médio e desempenho da barbearia.",
              },
              {
                icon: Smartphone,
                title: "Experiência moderna",
                desc: "Interface rápida, responsiva e pensada para uso no celular, tanto pelo barbeiro quanto pelo cliente.",
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 transition-colors hover:border-brand-400/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-400/10 text-brand-300">
                  <f.icon size={22} />
                </div>
                <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-neutral-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="border-t border-white/5 bg-ink-900/40 py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Como funciona</h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Barbearia se cadastra",
                desc: "O dono da barbearia cria uma conta, escolhe um plano e ativa o acesso pagando via Pix, cartão ou boleto.",
              },
              {
                step: "02",
                title: "Monta a vitrine",
                desc: "Cadastra serviços, preços, horários de funcionamento e personaliza o perfil público da barbearia.",
              },
              {
                step: "03",
                title: "Clientes agendam e pagam",
                desc: "Clientes criam conta, encontram a barbearia, escolhem o horário e pagam online com segurança.",
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <span className="font-display text-5xl font-bold text-white/10">{s.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" className="border-t border-white/5 py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Planos para barbearias
            </h2>
            <p className="mt-3 text-neutral-400">
              Escolha o plano ideal para o tamanho da sua barbearia. Cancele quando quiser.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {(plans.length > 0
              ? plans
              : [
                  { id: "basico", name: "Básico", price: 49.9, description: "Ideal para autônomos", features: ["1 barbeiro", "Agenda online", "Pagamentos via Pix e cartão"], highlighted: false },
                  { id: "pro", name: "Profissional", price: 99.9, description: "Para barbearias em crescimento", features: ["Até 5 barbeiros", "Agenda online", "Relatórios de receita", "Suporte prioritário"], highlighted: true },
                  { id: "premium", name: "Premium", price: 179.9, description: "Para redes de barbearias", features: ["Barbeiros ilimitados", "Múltiplas unidades", "Relatórios avançados", "Suporte dedicado"], highlighted: false },
                ]
            ).map((plan: any) => (
              <div
                key={plan.id}
                className={`card relative flex flex-col p-8 ${
                  plan.highlighted ? "border-brand-400/50 shadow-glow" : ""
                }`}
              >
                {plan.highlighted && (
                  <span className="badge absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-ink-950">
                    Mais popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-400">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-white">
                    {formatBRL(plan.price)}
                  </span>
                  <span className="text-neutral-500">/mês</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-neutral-300">
                  {(plan.features as string[]).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registro?tipo=barbeiro"
                  className={`mt-8 ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
                >
                  Assinar plano
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="container-page">
          <div className="card flex flex-col items-center gap-6 overflow-hidden bg-gradient-to-br from-brand-500/10 to-transparent p-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Pronto para modernizar sua barbearia?
            </h2>
            <p className="max-w-xl text-neutral-400">
              Crie sua conta agora e comece a receber agendamentos e pagamentos online hoje mesmo.
            </p>
            <Link href="/registro" className="btn-primary px-8 py-3 text-base">
              Começar agora <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
