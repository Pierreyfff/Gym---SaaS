-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "usuario_id" TEXT,
ALTER COLUMN "nombre" DROP NOT NULL,
ALTER COLUMN "apellido" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "staff_usuario_id_idx" ON "staff"("usuario_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
