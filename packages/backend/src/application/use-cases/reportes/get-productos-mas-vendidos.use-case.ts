import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

export interface ProductoMasVendido {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
  ingresosTotales: number;
  precioPromedio: number;
}

@Injectable()
export class GetProductosMasVendidosUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    gimnasioId: string,
    limit: number = 10,
    fechaInicio?: Date,
    fechaFin?: Date,
  ): Promise<ProductoMasVendido[]> {
    // Construir filtro para ventas
    const whereVentas: any = { gimnasioId };

    if (fechaInicio || fechaFin) {
      whereVentas.fechaVenta = {};
      if (fechaInicio) whereVentas.fechaVenta.gte = fechaInicio;
      if (fechaFin) whereVentas.fechaVenta.lte = fechaFin;
    }

    // Obtener ventas agrupadas por producto
    const ventas = await this.prisma.ventaProducto.groupBy({
      by: ['productoId'],
      where: whereVentas,
      _sum: {
        cantidad: true,
        total: true,
      },
      orderBy: {
        _sum: {
          cantidad: 'desc',
        },
      },
      take: limit,
    });

    // Obtener información de los productos
    const resultado: ProductoMasVendido[] = [];

    for (const venta of ventas) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: venta.productoId },
        select: { nombre: true },
      });

      if (producto) {
        const cantidadVendida = venta._sum.cantidad || 0;
        const ingresosTotales = Number(venta._sum.total || 0);

        resultado.push({
          productoId: venta.productoId,
          nombre: producto.nombre,
          cantidadVendida,
          ingresosTotales,
          precioPromedio: cantidadVendida > 0 ? ingresosTotales / cantidadVendida : 0,
        });
      }
    }

    return resultado;
  }
}