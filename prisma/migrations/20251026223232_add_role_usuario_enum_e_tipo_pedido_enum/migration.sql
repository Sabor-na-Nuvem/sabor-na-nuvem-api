/*
  Warnings:

  - You are about to drop the column `paraEntrega` on the `carrinho` table. All the data in the column will be lost.
  - You are about to drop the column `paraEntrega` on the `pedido` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `isFuncionario` on the `usuario` table. All the data in the column will be lost.
  - Added the required column `tipoPedido` to the `carrinho` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoPedido` to the `pedido` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."RoleUsuario" AS ENUM ('CLIENTE', 'FUNCIONARIO', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."TipoPedido" AS ENUM ('ENTREGA', 'RETIRADA');

-- AlterTable
ALTER TABLE "public"."carrinho" DROP COLUMN "paraEntrega",
ADD COLUMN     "tipoPedido" "public"."TipoPedido" NOT NULL;

-- AlterTable
ALTER TABLE "public"."pedido" DROP COLUMN "paraEntrega",
ADD COLUMN     "tipoPedido" "public"."TipoPedido" NOT NULL;

-- AlterTable
ALTER TABLE "public"."usuario" DROP COLUMN "isAdmin",
DROP COLUMN "isFuncionario",
ADD COLUMN     "cargo" "public"."RoleUsuario" NOT NULL DEFAULT 'CLIENTE';
