/*
  Warnings:

  - Added the required column `senha` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AuthTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_UPDATE');

-- AlterTable
ALTER TABLE "public"."usuario" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senha" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."authToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" "public"."AuthTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."authRefreshToken" (
    "id" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "validatorHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authToken_token_key" ON "public"."authToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "authRefreshToken_selector_key" ON "public"."authRefreshToken"("selector");

-- AddForeignKey
ALTER TABLE "public"."authToken" ADD CONSTRAINT "authToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."authRefreshToken" ADD CONSTRAINT "authRefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
