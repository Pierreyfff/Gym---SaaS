-- CreateTable
CREATE TABLE "configuraciones_gimnasio" (
    "id" TEXT NOT NULL,
    "gimnasioId" TEXT NOT NULL,
    "nombreNegocio" TEXT,
    "logoUrl" TEXT,
    "colorPrimario" TEXT NOT NULL DEFAULT '#10b981',
    "colorSecundario" TEXT NOT NULL DEFAULT '#3b82f6',
    "horarioApertura" TEXT,
    "horarioCierre" TEXT,
    "diasLaborales" TEXT[] DEFAULT ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']::TEXT[],
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "sitioweb" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "politicaCancelacion" TEXT,
    "terminosCondiciones" TEXT,
    "notificarVencimiento7Dias" BOOLEAN NOT NULL DEFAULT true,
    "notificarVencimiento3Dias" BOOLEAN NOT NULL DEFAULT true,
    "notificarVencimiento1Dia" BOOLEAN NOT NULL DEFAULT true,
    "notificarBienvenida" BOOLEAN NOT NULL DEFAULT true,
    "notificarRenovacion" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_gimnasio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_gimnasio_gimnasioId_key" ON "configuraciones_gimnasio"("gimnasioId");

-- AddForeignKey
ALTER TABLE "configuraciones_gimnasio" ADD CONSTRAINT "configuraciones_gimnasio_gimnasioId_fkey" FOREIGN KEY ("gimnasioId") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
