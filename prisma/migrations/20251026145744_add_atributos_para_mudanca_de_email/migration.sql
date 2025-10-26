/*
  Warnings:

  - A unique constraint covering the columns `[changeEmailToken]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."usuario" ADD COLUMN     "changeEmailToken" TEXT,
ADD COLUMN     "changeEmailTokenExpires" TIMESTAMP(3),
ADD COLUMN     "newEmailPendingVerification" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "usuario_changeEmailToken_key" ON "public"."usuario"("changeEmailToken");
