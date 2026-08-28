import type { Metadata } from "next";
// Fontes auto-hospedadas (não dependem do CDN do Google em build nem em runtime).
import "@fontsource-variable/inter";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "BarberPro — Plataforma completa para barbearias",
  description:
    "Gerencie sua barbearia, receba agendamentos e pagamentos online com Pix, cartão e boleto. Painel para administradores, barbeiros e clientes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
