-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('completado', 'pendiente', 'reembolsado', 'rechazado');

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "estado" "EstadoPago" NOT NULL DEFAULT 'completado',
ADD COLUMN     "fecha_reembolso" TIMESTAMP(3),
ADD COLUMN     "motivo_reembolso" TEXT;

-- CreateIndex
CREATE INDEX "pagos_estado_idx" ON "pagos"("estado");
