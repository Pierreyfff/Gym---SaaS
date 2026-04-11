import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

export interface IngresoDiario {
  fecha: string;
  ingresos: number;
  membresias: number;
  productos: number;
  transacciones: number;
}

@Injectable()
export class GetIngresosDiariosUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(
    gimnasioId: string,
    dias: number = 30,
  ): Promise<IngresoDiario[]> {
    const now = new Date();
    const fechaInicio = new Date(now);
    fechaInicio.setDate(fechaInicio.getDate() - dias + 1);
    fechaInicio.setHours(0, 0, 0, 0);

    // Obtener pagos
    const pagos = await this.prisma.pago.findMany({
      where: {
        gimnasioId,
        tipo: 'membresia',
        fechaPago: { gte: fechaInicio },
      },
      select: {
        monto: true,
        fechaPago: true,
      },
    });

    // Obtener ventas
    const ventas = await this.prisma.ventaProducto.findMany({
      where: {
        gimnasioId,
        fechaVenta: { gte: fechaInicio },
      },
      select: {
        total: true,
        fechaVenta: true,
      },
    });

    // Agrupar por día
    const ingresosPorDia: Record<
      string,
      { membresias: number; productos: number; transacciones: number }
    > = {};

    // Inicializar todos los días
    for (let i = 0; i < dias; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      const key = fecha.toISOString().split('T')[0];
      ingresosPorDia[key] = { membresias: 0, productos: 0, transacciones: 0 };
    }

    // Procesar pagos
    pagos.forEach((pago) => {
      const key = new Date(pago.fechaPago).toISOString().split('T')[0];
      if (ingresosPorDia[key]) {
        ingresosPorDia[key].membresias += Number(pago.monto);
        ingresosPorDia[key].transacciones += 1;
      }
    });

    // Procesar ventas
    ventas.forEach((venta) => {
      const key = new Date(venta.fechaVenta).toISOString().split('T')[0];
      if (ingresosPorDia[key]) {
        ingresosPorDia[key].productos += Number(venta.total);
        ingresosPorDia[key].transacciones += 1;
      }
    });

    // Convertir a array
    const resultado: IngresoDiario[] = Object.entries(ingresosPorDia)
      .map(([fecha, data]) => ({
        fecha,
        ingresos: data.membresias + data.productos,
        membresias: data.membresias,
        productos: data.productos,
        transacciones: data.transacciones,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return resultado;
  }
}