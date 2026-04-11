import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

export interface EstadisticasGenerales {
  totalClientes: number;
  clientesActivos: number;
  totalMembresias: number;
  membresiasActivas: number;
  membresiasExpiradas: number;
  membresiasCanceladas: number;
  totalIngresos: number;
  ingresosMesActual: number;
  ingresosMembresias: number;
  ingresosVentas: number;
  ingresosMembresiaMesActual: number;
  ingresosVentasMesActual: number;
  asistenciasMesActual: number;
}

export interface IngresosMensuales {
  mes: string;
  ingresos: number;
  cantidad: number;
}

export interface PlanMasVendido {
  planId: string;
  planNombre: string;
  cantidad: number;
  ingresos: number;
}

export interface AsistenciasPorMes {
  mes: string;
  cantidad: number;
}

@Injectable()
export class EstadisticasService {
  constructor(private readonly prisma: PrismaClient) {}

  async getEstadisticasGenerales(gimnasioId: string): Promise<EstadisticasGenerales> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalClientes,
      clientesActivos,
      totalMembresias,
      membresiasActivas,
      membresiasExpiradas,
      membresiasCanceladas,
      pagosMembresiasTotal,
      pagosMembresiaMesActual,
      ventasProductosTotal,
      ventasProductosMesActual,
      asistenciasMesActual,
    ] = await Promise.all([
      // Total clientes
      this.prisma.usuario.count({
        where: { gimnasioId, rol: 'cliente' },
      }),

      // Clientes activos (con membresía activa)
      this.prisma.usuario.count({
        where: {
          gimnasioId,
          rol: 'cliente',
          estado: 'activo',
          membresias: {
            some: { estado: 'activa' },
          },
        },
      }),

      // Total membresías
      this.prisma.membresia.count({
        where: { gimnasioId },
      }),

      // Membresías activas
      this.prisma.membresia.count({
        where: { gimnasioId, estado: 'activa' },
      }),

      // Membresías expiradas
      this.prisma.membresia.count({
        where: { gimnasioId, estado: 'expirada' },
      }),

      // Membresías canceladas
      this.prisma.membresia.count({
        where: { gimnasioId, estado: 'cancelada' },
      }),

      // Ingresos por pagos de membresías (total)
      this.prisma.pago.aggregate({
        where: { gimnasioId, tipo: 'membresia' },
        _sum: { monto: true },
      }),

      // Ingresos por pagos de membresías (mes actual)
      this.prisma.pago.aggregate({
        where: {
          gimnasioId,
          tipo: 'membresia',
          fechaPago: { gte: inicioMes, lte: finMes },
        },
        _sum: { monto: true },
      }),

      // Ingresos por ventas de productos (total)
      this.prisma.ventaProducto.aggregate({
        where: { gimnasioId },
        _sum: { total: true },
      }),

      // Ingresos por ventas de productos (mes actual)
      this.prisma.ventaProducto.aggregate({
        where: {
          gimnasioId,
          fechaVenta: { gte: inicioMes, lte: finMes },
        },
        _sum: { total: true },
      }),

      // Asistencias mes actual
      this.prisma.asistencia.count({
        where: {
          gimnasioId,
          marcaTiempo: { gte: inicioMes, lte: finMes },
        },
      }),
    ]);

    const ingresosMembresias = Number(pagosMembresiasTotal._sum.monto || 0);
    const ingresosMembresiaMesActual = Number(pagosMembresiaMesActual._sum.monto || 0);
    const ingresosVentas = Number(ventasProductosTotal._sum.total || 0);
    const ingresosVentasMesActual = Number(ventasProductosMesActual._sum.total || 0);

    return {
      totalClientes,
      clientesActivos,
      totalMembresias,
      membresiasActivas,
      membresiasExpiradas,
      membresiasCanceladas,
      totalIngresos: ingresosMembresias + ingresosVentas,
      ingresosMesActual: ingresosMembresiaMesActual + ingresosVentasMesActual,
      ingresosMembresias,
      ingresosVentas,
      ingresosMembresiaMesActual,
      ingresosVentasMesActual,
      asistenciasMesActual,
    };
  }

  async getIngresosMensuales(gimnasioId: string, meses: number = 6): Promise<IngresosMensuales[]> {
    const now = new Date();
    const fechaInicio = new Date(now.getFullYear(), now.getMonth() - meses + 1, 1);

    const pagos = await this.prisma.pago.findMany({
      where: {
        gimnasioId,
        fechaPago: { gte: fechaInicio },
      },
      select: {
        monto: true,
        fechaPago: true,
      },
      orderBy: { fechaPago: 'asc' },
    });

    // Agrupar por mes
    const ingresosPorMes: Record<string, { ingresos: number; cantidad: number }> = {};

    pagos.forEach((pago) => {
      const fecha = new Date(pago.fechaPago);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!ingresosPorMes[mesKey]) {
        ingresosPorMes[mesKey] = { ingresos: 0, cantidad: 0 };
      }

      ingresosPorMes[mesKey].ingresos += Number(pago.monto);
      ingresosPorMes[mesKey].cantidad += 1;
    });

    // Convertir a array y formatear
    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const resultado: IngresosMensuales[] = [];
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesNombre = `${mesesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;

      resultado.push({
        mes: mesNombre,
        ingresos: ingresosPorMes[mesKey]?.ingresos || 0,
        cantidad: ingresosPorMes[mesKey]?.cantidad || 0,
      });
    }

    return resultado;
  }

  async getPlanesMasVendidos(gimnasioId: string, limit: number = 5): Promise<PlanMasVendido[]> {
    const membresias = await this.prisma.membresia.groupBy({
      by: ['planId'],
      where: { gimnasioId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const resultado: PlanMasVendido[] = [];

    for (const m of membresias) {
      const plan = await this.prisma.plan.findUnique({
        where: { id: m.planId },
        select: { nombre: true, precio: true },
      });

      if (plan) {
        resultado.push({
          planId: m.planId,
          planNombre: plan.nombre,
          cantidad: m._count.id,
          ingresos: Number(plan.precio) * m._count.id,
        });
      }
    }

    return resultado;
  }

  async getAsistenciasPorMes(gimnasioId: string, meses: number = 6): Promise<AsistenciasPorMes[]> {
    const now = new Date();
    const fechaInicio = new Date(now.getFullYear(), now.getMonth() - meses + 1, 1);

    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        gimnasioId,
        marcaTiempo: { gte: fechaInicio },
      },
      select: {
        marcaTiempo: true,
      },
      orderBy: { marcaTiempo: 'asc' },
    });

    // Agrupar por mes
    const asistenciasPorMes: Record<string, number> = {};

    asistencias.forEach((asistencia) => {
      const fecha = new Date(asistencia.marcaTiempo);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

      if (!asistenciasPorMes[mesKey]) {
        asistenciasPorMes[mesKey] = 0;
      }

      asistenciasPorMes[mesKey] += 1;
    });

    // Convertir a array y formatear
    const mesesNombres = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const resultado: AsistenciasPorMes[] = [];
    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesNombre = `${mesesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`;

      resultado.push({
        mes: mesNombre,
        cantidad: asistenciasPorMes[mesKey] || 0,
      });
    }

    return resultado;
  }
}