-- Schema SQL do BarberPro (equivalente ao prisma/schema.prisma).
-- Use este arquivo apenas se não puder rodar `npx prisma db push`.
-- Aplicar com:  psql "$DATABASE_URL" -f prisma/init.sql

CREATE TYPE "Role" AS ENUM ('ADMIN', 'BARBEIRO', 'CLIENTE');
CREATE TYPE "BarbershopStatus" AS ENUM ('PENDENTE', 'ATIVA', 'SUSPENSA');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDENTE', 'ATIVA', 'VENCIDA', 'CANCELADA');
CREATE TYPE "BookingStatus" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDENTE', 'PAGO', 'FALHOU', 'REEMBOLSADO');
CREATE TYPE "PaymentType" AS ENUM ('ASSINATURA', 'AGENDAMENTO');

CREATE TABLE "User" (
  "id"        TEXT PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "password"  TEXT NOT NULL,
  "role"      "Role" NOT NULL DEFAULT 'CLIENTE',
  "phone"     TEXT,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Plan" (
  "id"           TEXT PRIMARY KEY,
  "name"         TEXT NOT NULL,
  "price"        DECIMAL(10,2) NOT NULL,
  "intervalDays" INTEGER NOT NULL DEFAULT 30,
  "description"  TEXT,
  "features"     TEXT[] DEFAULT ARRAY[]::TEXT[],
  "highlighted"  BOOLEAN NOT NULL DEFAULT false,
  "active"       BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Barbershop" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "description" TEXT,
  "address"     TEXT,
  "phone"       TEXT,
  "logoUrl"     TEXT,
  "coverUrl"    TEXT,
  "status"      "BarbershopStatus" NOT NULL DEFAULT 'PENDENTE',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ownerId"     TEXT NOT NULL,
  CONSTRAINT "Barbershop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Barbershop_slug_key" ON "Barbershop"("slug");
CREATE UNIQUE INDEX "Barbershop_ownerId_key" ON "Barbershop"("ownerId");

CREATE TABLE "WorkingHour" (
  "id"           TEXT PRIMARY KEY,
  "barbershopId" TEXT NOT NULL,
  "dayOfWeek"    INTEGER NOT NULL,
  "startTime"    TEXT NOT NULL,
  "endTime"      TEXT NOT NULL,
  "closed"       BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "WorkingHour_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WorkingHour_barbershopId_dayOfWeek_key" ON "WorkingHour"("barbershopId", "dayOfWeek");

CREATE TABLE "Service" (
  "id"              TEXT PRIMARY KEY,
  "barbershopId"    TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "description"     TEXT,
  "price"           DECIMAL(10,2) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "active"          BOOLEAN NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Booking" (
  "id"            TEXT PRIMARY KEY,
  "barbershopId"  TEXT NOT NULL,
  "serviceId"     TEXT NOT NULL,
  "clientId"      TEXT NOT NULL,
  "date"          TIMESTAMP(3) NOT NULL,
  "status"        "BookingStatus" NOT NULL DEFAULT 'PENDENTE',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
  "price"         DECIMAL(10,2) NOT NULL,
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Booking_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "Booking_barbershopId_date_idx" ON "Booking"("barbershopId", "date");

CREATE TABLE "Subscription" (
  "id"               TEXT PRIMARY KEY,
  "barbershopId"     TEXT NOT NULL,
  "planId"           TEXT NOT NULL,
  "status"           "SubscriptionStatus" NOT NULL DEFAULT 'PENDENTE',
  "startedAt"        TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Subscription_barbershopId_key" ON "Subscription"("barbershopId");

CREATE TABLE "Payment" (
  "id"             TEXT PRIMARY KEY,
  "type"           "PaymentType" NOT NULL,
  "amount"         DECIMAL(10,2) NOT NULL,
  "status"         "PaymentStatus" NOT NULL DEFAULT 'PENDENTE',
  "provider"       TEXT NOT NULL DEFAULT 'mercadopago',
  "externalId"     TEXT,
  "method"         TEXT,
  "subscriptionId" TEXT,
  "bookingId"      TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt"         TIMESTAMP(3),
  "rawPayload"     JSONB,
  CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");
CREATE INDEX "Payment_externalId_idx" ON "Payment"("externalId");
