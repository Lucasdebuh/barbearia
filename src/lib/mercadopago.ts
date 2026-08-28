import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? "";

export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 8000 },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);

export function isMercadoPagoConfigured() {
  return Boolean(accessToken);
}
