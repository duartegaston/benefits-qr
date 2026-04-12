-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoReclamo" AS ENUM ('PENDIENTE', 'CANJEADO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('LOCAL', 'CLIENTE');

-- CreateTable
CREATE TABLE "Local" (
    "id" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "googleId" TEXT,
    "logoUrl" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "pendingApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficio" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "maxUsos" INTEGER,
    "diasValidos" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "localId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Beneficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "nombre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClienteOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reclamo" (
    "id" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fechaReclamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCanje" TIMESTAMP(3),
    "qrToken" TEXT,
    "qrTokenExpira" TIMESTAMP(3),
    "estado" "EstadoReclamo" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "Reclamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Local_email_key" ON "Local"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Local_googleId_key" ON "Local"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "LocalOtp_email_key" ON "LocalOtp"("email");

-- CreateIndex
CREATE INDEX "Beneficio_localId_idx" ON "Beneficio"("localId");

-- CreateIndex
CREATE INDEX "Beneficio_deletedAt_idx" ON "Beneficio"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_phone_key" ON "Cliente"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteOtp_email_key" ON "ClienteOtp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteOtp_phone_key" ON "ClienteOtp"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Reclamo_qrToken_key" ON "Reclamo"("qrToken");

-- CreateIndex
CREATE INDEX "Reclamo_clienteId_estado_idx" ON "Reclamo"("clienteId", "estado");

-- CreateIndex
CREATE INDEX "Reclamo_beneficioId_estado_idx" ON "Reclamo"("beneficioId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "Beneficio" ADD CONSTRAINT "Beneficio_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamo" ADD CONSTRAINT "Reclamo_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "Beneficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reclamo" ADD CONSTRAINT "Reclamo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
