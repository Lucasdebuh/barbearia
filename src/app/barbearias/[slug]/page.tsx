import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { formatBRL, WEEKDAYS } from "@/lib/utils";
import { MapPin, Phone, Scissors, Clock } from "lucide-react";
import BookingWidget from "@/components/cliente/BookingWidget";

export const dynamic = "force-dynamic";

export default async function BarbershopDetail({ params }: { params: { slug: string } }) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
    include: {
      services: { where: { active: true }, orderBy: { price: "asc" } },
      workingHours: { orderBy: { dayOfWeek: "asc" } },
    },
  });

  if (!barbershop || barbershop.status !== "ATIVA") {
    notFound();
  }

  const services = barbershop.services.map((s: any) => ({ ...s, price: Number(s.price) }));

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-brand-500/20 to-ink-900 sm:h-72">
        {barbershop.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={barbershop.coverUrl} alt={barbershop.name} className="h-full w-full object-cover" />
        ) : (
          <Scissors size={48} className="text-brand-300" />
        )}
      </div>

      <div className="container-page -mt-12 pb-20">
        <div className="card p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold text-white">{barbershop.name}</h1>
          {barbershop.description && <p className="mt-2 text-neutral-400">{barbershop.description}</p>}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-400">
            {barbershop.address && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {barbershop.address}</span>
            )}
            {barbershop.phone && (
              <span className="flex items-center gap-1"><Phone size={14} /> {barbershop.phone}</span>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="mb-4 font-display text-xl font-bold text-white">Serviços</h2>
              <div className="space-y-3">
                {services.map((s: any) => (
                  <div key={s.id} className="card flex items-center justify-between p-5">
                    <div>
                      <p className="font-medium text-white">{s.name}</p>
                      {s.description && <p className="text-sm text-neutral-400">{s.description}</p>}
                      <p className="mt-1 text-xs text-neutral-500">{s.durationMinutes} minutos</p>
                    </div>
                    <span className="font-semibold text-brand-300">{formatBRL(s.price)}</span>
                  </div>
                ))}
                {services.length === 0 && <p className="text-sm text-neutral-500">Nenhum serviço cadastrado.</p>}
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-white">
                <Clock size={18} /> Horário de funcionamento
              </h2>
              <div className="card divide-y divide-white/5">
                {barbershop.workingHours.map((h: any) => (
                  <div key={h.dayOfWeek} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-neutral-300">{WEEKDAYS[h.dayOfWeek]}</span>
                    <span className="text-neutral-400">{h.closed ? "Fechado" : `${h.startTime} - ${h.endTime}`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <BookingWidget barbershopId={barbershop.id} services={services as any} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
