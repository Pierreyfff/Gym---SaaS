import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

export interface FiltrosIngresos {
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: 'membresia' | 'producto' | 'todos';
  metodoPago?: string;
}

export interface IngresoDetallado {
  id: string;
  tipo: 'membresia' | 'producto';
  descripcion: string;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
  };
  monto: number;
  metodoPago: string;
  fecha: Date;
}

export interface ResumenIngresos {
  totalIngresos: number;
  totalMembresias: number;
  totalProductos: number;
  cantidadTransacciones: number;
  promedioTransaccion: number;
  ingresosPorMetodo: Record<string, number>;
}

@Injectable()
export class GetIngresosDetalladosUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    gimnasioId: string,
    filtros: FiltrosIngresos,
  ): Promise<{ ingresos: IngresoDetallado[]; resumen: ResumenIngresos }> {
    const { fechaInicio, fechaFin, tipo, metodoPago } = filtros;

    // Construir filtros base
    const whereClausePagos: any = { gimnasioId };
    const whereClauseVentas: any = { gimnasioId };

    if (fechaInicio) {
      whereClausePagos.fechaPago = { gte: fechaInicio };
      whereClauseVentas.fechaVenta = { gte: fechaInicio };
    }

    if (fechaFin) {
      whereClausePagos.fechaPago = {
        ...whereClausePagos.fechaPago,
        lte: fechaFin,
      };
      whereClauseVentas.fechaVenta = {
        ...whereClauseVentas.fechaVenta,
        lte: fechaFin,
      };
    }

    if (metodoPago) {
      whereClausePagos.metodoPago = metodoPago;
      whereClauseVentas.metodoPago = metodoPago;
    }

    // Obtener ingresos según tipo
    const ingresos: IngresoDetallado[] = [];

    // Pagos de membresías
    if (tipo === 'membresia' || tipo === 'todos' || !tipo) {
      const pagos = await this.prisma.pago.findMany({
        where: { ...whereClausePagos, tipo: 'membresia' },
        include: {
          membresia: {
            include: {
              cliente: true,
              plan: true,
            },
          },
        },
        orderBy: { fechaPago: 'desc' },
      });

      ingresos.push(
        ...pagos.map((pago) => ({
          id: pago.id,
          tipo: 'membresia' as const,
          descripcion: `Membresía: ${pago.membresia.plan.nombre}`,
          cliente: {
            id: pago.membresia.cliente.id,
            nombre: pago.membresia.cliente.nombre,
            apellido: pago.membresia.cliente.apellido,
          },
          monto: Number(pago.monto),
          metodoPago: pago.metodoPago,
          fecha: pago.fechaPago,
        })),
      );
    }

    // Ventas de productos
    if (tipo === 'producto' || tipo === 'todos' || !tipo) {
      const ventas = await this.prisma.ventaProducto.findMany({
        where: whereClauseVentas,
        include: {
          cliente: true,
          producto: true,
        },
        orderBy: { fechaVenta: 'desc' },
      });

      ingresos.push(
        ...ventas.map((venta) => ({
          id: venta.id,
          tipo: 'producto' as const,
          descripcion: `${venta.producto.nombre} (x${venta.cantidad})`,
          cliente: venta.cliente
            ? {
                id: venta.cliente.id,
                nombre: venta.cliente.nombre,
                apellido: venta.cliente.apellido,
              }
            : {
                id: '',
                nombre: 'Venta',
                apellido: 'Directa',
              },
          monto: Number(venta.total),
          metodoPago: venta.metodoPago,
          fecha: venta.fechaVenta,
        })),
      );
    }

    // Ordenar por fecha descendente
    ingresos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    // Calcular resumen
    const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
    const totalMembresias = ingresos
      .filter((i) => i.tipo === 'membresia')
      .reduce((sum, i) => sum + i.monto, 0);
    const totalProductos = ingresos
      .filter((i) => i.tipo === 'producto')
      .reduce((sum, i) => sum + i.monto, 0);
    const cantidadTransacciones = ingresos.length;
    const promedioTransaccion =
      cantidadTransacciones > 0 ? totalIngresos / cantidadTransacciones : 0;

    // Ingresos por método de pago
    const ingresosPorMetodo: Record<string, number> = {};
    ingresos.forEach((ingreso) => {
      if (!ingresosPorMetodo[ingreso.metodoPago]) {
        ingresosPorMetodo[ingreso.metodoPago] = 0;
      }
      ingresosPorMetodo[ingreso.metodoPago] += ingreso.monto;
    });

    const resumen: ResumenIngresos = {
      totalIngresos,
      totalMembresias,
      totalProductos,
      cantidadTransacciones,
      promedioTransaccion,
      ingresosPorMetodo,
    };

    return { ingresos, resumen };
  }
}