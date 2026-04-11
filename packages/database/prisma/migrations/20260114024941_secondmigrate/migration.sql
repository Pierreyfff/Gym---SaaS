-- CreateTable
CREATE TABLE "categorias_productos" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "categoria_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stock_minimo" INTEGER NOT NULL DEFAULT 5,
    "imagen_url" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas_productos" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cliente_id" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "nota" TEXT,
    "fecha_venta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventas_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_inventario" (
    "id" TEXT NOT NULL,
    "gimnasio_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stock_anterior" INTEGER NOT NULL,
    "stock_nuevo" INTEGER NOT NULL,
    "motivo" TEXT,
    "referencia" TEXT,
    "creado_por_id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_inventario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categorias_productos_gimnasio_id_idx" ON "categorias_productos"("gimnasio_id");

-- CreateIndex
CREATE INDEX "productos_gimnasio_id_idx" ON "productos"("gimnasio_id");

-- CreateIndex
CREATE INDEX "productos_categoria_id_idx" ON "productos"("categoria_id");

-- CreateIndex
CREATE INDEX "productos_estado_idx" ON "productos"("estado");

-- CreateIndex
CREATE INDEX "ventas_productos_gimnasio_id_idx" ON "ventas_productos"("gimnasio_id");

-- CreateIndex
CREATE INDEX "ventas_productos_producto_id_idx" ON "ventas_productos"("producto_id");

-- CreateIndex
CREATE INDEX "ventas_productos_cliente_id_idx" ON "ventas_productos"("cliente_id");

-- CreateIndex
CREATE INDEX "ventas_productos_fecha_venta_idx" ON "ventas_productos"("fecha_venta");

-- CreateIndex
CREATE INDEX "movimientos_inventario_gimnasio_id_idx" ON "movimientos_inventario"("gimnasio_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_producto_id_idx" ON "movimientos_inventario"("producto_id");

-- CreateIndex
CREATE INDEX "movimientos_inventario_tipo_idx" ON "movimientos_inventario"("tipo");

-- CreateIndex
CREATE INDEX "movimientos_inventario_fecha_creacion_idx" ON "movimientos_inventario"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "categorias_productos" ADD CONSTRAINT "categorias_productos_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_productos" ADD CONSTRAINT "ventas_productos_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_productos" ADD CONSTRAINT "ventas_productos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas_productos" ADD CONSTRAINT "ventas_productos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_gimnasio_id_fkey" FOREIGN KEY ("gimnasio_id") REFERENCES "gimnasios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
