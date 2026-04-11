-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'recepcionista', 'entrenador', 'cliente');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo');

-- CreateEnum
CREATE TYPE "EstadoMembresia" AS ENUM ('activa', 'expirada', 'cancelada');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('efectivo', 'tarjeta', 'transferencia');

-- CreateTable
CREATE TABLE "gimnasios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gimnasios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "RolUsuario" NOT NULL,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfiles_cliente" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "genero" TEXT,
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "duracion_dias" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membresias" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoMembresia" NOT NULL DEFAULT 'activa',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membresias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "membresia_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "nota" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "marca_tiempo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrenadores_clientes" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "entrenador_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrenadores_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutinas" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "entrenador_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rutinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios" (
    "id" TEXT NOT NULL,
    "rutina_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "repeticiones" INTEGER,
    "series" INTEGER,
    "segundos_descanso" INTEGER,
    "orden_indice" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ejercicios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gimnasios_slug_key" ON "gimnasios"("slug");

-- CreateIndex
CREATE INDEX "usuarios_gimnasio_id_idx" ON "usuarios"("gimnasio_id");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_rol_idx" ON "usuarios"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_gimnasio_id_email_key" ON "usuarios"("gimnasio_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_cliente_usuario_id_key" ON "perfiles_cliente"("usuario_id");

-- CreateIndex
CREATE INDEX "planes_gimnasio_id_idx" ON "planes"("gimnasio_id");

-- CreateIndex
CREATE INDEX "membresias_gimnasio_id_idx" ON "membresias"("gimnasio_id");

-- CreateIndex
CREATE INDEX "membresias_cliente_id_idx" ON "membresias"("cliente_id");

-- CreateIndex
CREATE INDEX "membresias_estado_idx" ON "membresias"("estado");

-- CreateIndex
CREATE INDEX "pagos_gimnasio_id_idx" ON "pagos"("gimnasio_id");

-- CreateIndex
CREATE INDEX "pagos_cliente_id_idx" ON "pagos"("cliente_id");

-- CreateIndex
CREATE INDEX "pagos_fecha_pago_idx" ON "pagos"("fecha_pago");

-- CreateIndex
CREATE INDEX "asistencias_gimnasio_id_idx" ON "asistencias"("gimnasio_id");

-- CreateIndex
CREATE INDEX "asistencias_cliente_id_idx" ON "asistencias"("cliente_id");

-- CreateIndex
CREATE INDEX "asistencias_marca_tiempo_idx" ON "asistencias"("marca_tiempo");

-- CreateIndex
CREATE INDEX "entrenadores_clientes_gimnasio_id_idx" ON "entrenadores_clientes"("gimnasio_id");

-- CreateIndex
CREATE INDEX "entrenadores_clientes_entrenador_id_idx" ON "entrenadores_clientes"("entrenador_id");

-- CreateIndex
CREATE INDEX "entrenadores_clientes_cliente_id_idx" ON "entrenadores_clientes"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "entrenadores_clientes_entrenador_id_cliente_id_key" ON "entrenadores_clientes"("entrenador_id", "cliente_id");

-- CreateIndex
CREATE INDEX "rutinas_gimnasio_id_idx" ON "rutinas"("gimnasio_id");

-- CreateIndex
CREATE INDEX "rutinas_entrenador_id_idx" ON "rutinas"("entrenador_id");

-- CreateIndex
CREATE INDEX "rutinas_cliente_id_idx" ON "rutinas"("cliente_id");

-- CreateIndex
CREATE INDEX "ejercicios_rutina_id_idx" ON "ejercicios"("rutina_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_cliente" ADD CONSTRAINT "perfiles_cliente_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes" ADD CONSTRAINT "planes_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membresias" ADD CONSTRAINT "membresias_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_membresia_id_fkey" FOREIGN KEY ("membresia_id") REFERENCES "membresias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenadores_clientes" ADD CONSTRAINT "entrenadores_clientes_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenadores_clientes" ADD CONSTRAINT "entrenadores_clientes_entrenador_id_fkey" FOREIGN KEY ("entrenador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrenadores_clientes" ADD CONSTRAINT "entrenadores_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutinas" ADD CONSTRAINT "rutinas_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutinas" ADD CONSTRAINT "rutinas_entrenador_id_fkey" FOREIGN KEY ("entrenador_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutinas" ADD CONSTRAINT "rutinas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ejercicios" ADD CONSTRAINT "ejercicios_rutina_id_fkey" FOREIGN KEY ("rutina_id") REFERENCES "rutinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
