-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('membresia', 'producto');

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "tipo" "TipoPago" NOT NULL DEFAULT 'membresia',
ALTER COLUMN "membresia_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "pagos_tipo_idx" ON "pagos"("tipo");
