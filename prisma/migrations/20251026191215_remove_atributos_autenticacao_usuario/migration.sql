/*
  Warnings:

  - The primary key for the `carrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `itemCarrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `relatorioUsuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `changeEmailToken` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `changeEmailTokenExpires` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpires` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `newEmailPendingVerification` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordTokenExpires` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `usuario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."carrinho" DROP CONSTRAINT "carrinho_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."cupomDesconto" DROP CONSTRAINT "cupom_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_carrinho_fk";

-- DropForeignKey
ALTER TABLE "public"."pedido" DROP CONSTRAINT "pedido_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."relatorioUsuario" DROP CONSTRAINT "relatorio_usuario_fk";

-- DropForeignKey
ALTER TABLE "public"."telefone" DROP CONSTRAINT "telefone_usuario_fk";

-- DropIndex
DROP INDEX "public"."usuario_changeEmailToken_key";

-- DropIndex
DROP INDEX "public"."usuario_emailVerificationToken_key";

-- DropIndex
DROP INDEX "public"."usuario_resetPasswordToken_key";

-- AlterTable
ALTER TABLE "public"."carrinho" DROP CONSTRAINT "carrinho_pkey",
ALTER COLUMN "idCarrinho" SET DATA TYPE TEXT,
ADD CONSTRAINT "carrinho_pkey" PRIMARY KEY ("idCarrinho");

-- AlterTable
ALTER TABLE "public"."cupomDesconto" ALTER COLUMN "usuarioId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."itemCarrinho" DROP CONSTRAINT "itemCarrinho_pkey",
ALTER COLUMN "carrinhoId" SET DATA TYPE TEXT,
ADD CONSTRAINT "itemCarrinho_pkey" PRIMARY KEY ("carrinhoId", "produtoId");

-- AlterTable
ALTER TABLE "public"."pedido" ALTER COLUMN "clienteId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."relatorioUsuario" DROP CONSTRAINT "relatorioUsuario_pkey",
ALTER COLUMN "usuarioId" SET DATA TYPE TEXT,
ADD CONSTRAINT "relatorioUsuario_pkey" PRIMARY KEY ("usuarioId");

-- AlterTable
ALTER TABLE "public"."telefone" ALTER COLUMN "usuarioId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."usuario" DROP CONSTRAINT "usuario_pkey",
DROP COLUMN "changeEmailToken",
DROP COLUMN "changeEmailTokenExpires",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpires",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "isEmailVerified",
DROP COLUMN "newEmailPendingVerification",
DROP COLUMN "resetPasswordToken",
DROP COLUMN "resetPasswordTokenExpires",
DROP COLUMN "senha",
ALTER COLUMN "idUsuario" DROP DEFAULT,
ALTER COLUMN "idUsuario" SET DATA TYPE TEXT,
ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("idUsuario");
DROP SEQUENCE "usuario_idUsuario_seq";

-- AddForeignKey
ALTER TABLE "public"."telefone" ADD CONSTRAINT "telefone_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relatorioUsuario" ADD CONSTRAINT "relatorio_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cupomDesconto" ADD CONSTRAINT "cupom_usuario_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("idUsuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedido" ADD CONSTRAINT "pedido_usuario_fk" FOREIGN KEY ("clienteId") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."carrinho" ADD CONSTRAINT "carrinho_usuario_fk" FOREIGN KEY ("idCarrinho") REFERENCES "public"."usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."itemCarrinho" ADD CONSTRAINT "itemCarrinho_carrinho_fk" FOREIGN KEY ("carrinhoId") REFERENCES "public"."carrinho"("idCarrinho") ON DELETE RESTRICT ON UPDATE CASCADE;
