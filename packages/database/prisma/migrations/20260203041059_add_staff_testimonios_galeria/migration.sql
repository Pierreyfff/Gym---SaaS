-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen_url" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "instagram" TEXT,
    "facebook" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonios" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "nombre_cliente" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL DEFAULT 5,
    "imagen_url" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_galeria" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "titulo" TEXT,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_galeria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_gimnasio_id_idx" ON "staff"("gimnasio_id");

-- CreateIndex
CREATE INDEX "staff_activo_idx" ON "staff"("activo");

-- CreateIndex
CREATE INDEX "testimonios_gimnasio_id_idx" ON "testimonios"("gimnasio_id");

-- CreateIndex
CREATE INDEX "testimonios_activo_idx" ON "testimonios"("activo");

-- CreateIndex
CREATE INDEX "imagenes_galeria_gimnasio_id_idx" ON "imagenes_galeria"("gimnasio_id");

-- CreateIndex
CREATE INDEX "imagenes_galeria_activo_idx" ON "imagenes_galeria"("activo");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonios" ADD CONSTRAINT "testimonios_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_galeria" ADD CONSTRAINT "imagenes_galeria_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
