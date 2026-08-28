import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { MapPin, Scissors, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarbershopsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const barbershops = await prisma.barbershop.findMany({
    where: {
      status: "ATIVA",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { services: { where: { active: true }, take: 3 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container-page py-12">
        <h1 className="font-display text-3xl font-bold text-white">Encontre sua barbearia</h1>
        <p className="mt-2 text-neutral-400">Escolha uma barbearia e agende seu horário online.</p>

        <form className="mt-6 max-w-md">
          <input
            name="q"
            defaultValue={q}
            className="input"
            placeholder="Buscar por nome ou endereço..."
          />
        </form>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {barbershops.length === 0 && (
            <p className="col-span-full py-16 text-center text-neutral-500">
              Nenhuma barbearia encontrada.
            </p>
          )}
          {barbershops.map((b: any) => (
            <Link key={b.id} href={`/barbearias/${b.slug}`} className="card group overflow-hidden transition-colors hover:border-brand-400/40">
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-500/20 to-ink-900">
                {b.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.coverUrl} alt={b.name} className="h-full w-full object-cover" />
                ) : (
                  <Scissors size={32} className="text-brand-300" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white group-hover:text-brand-300">{b.name}</h3>
                {b.address && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                    <MapPin size={12} /> {b.address}
                  </p>
                )}
                {b.description && <p className="mt-2 line-clamp-2 text-sm text-neutral-400">{b.description}</p>}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400">
                  Ver horários <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
