import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

interface EstadisticasGenerales {
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

@Injectable()
export class GetEstadisticasGeneralesUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(gimnasioId: string): Promise<EstadisticasGenerales> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const finMes = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Clientes
    const totalClientes = await this.prisma.usuario.count({
      where: { gimnasioId, rol: 'cliente' },
    });

    const clientesActivos = await this. prisma.usuario.count({
      where: { gimnasioId, rol: 'cliente', estado: 'activo' },
    });

    // Membresías
    const totalMembresias = await this.prisma.membresia.count({
      where: { gimnasioId },
    });

    const membresiasActivas = await this. prisma.membresia.count({
      where: { gimnasioId, estado: 'activa' },
    });

    const membresiasExpiradas = await this.prisma.membresia.count({
      where: { gimnasioId, estado: 'expirada' },
    });

    const membresiasCanceladas = await this.prisma.membresia.count({
      where: { gimnasioId, estado: 'cancelada' },
    });

    // Ingresos por pagos de membresías
    const pagosMembresias = await this.prisma.pago.aggregate({
      where: { gimnasioId, tipo: 'membresia' },
      _sum: { monto: true },
    });

    const ingresosMembresias = Number(pagosMembresias._sum.monto || 0);

    const pagosMesActualMembresias = await this.prisma.pago.aggregate({
      where: {
        gimnasioId,
        tipo: 'membresia',
        fechaPago: { gte: inicioMes, lte: finMes },
      },
      _sum: { monto: true },
    });

    const ingresosMembresiaMesActual = Number(pagosMesActualMembresias._sum.monto || 0);

    // Ingresos por ventas de productos
    const ventasProductos = await this.prisma.ventaProducto.aggregate({
      where: { gimnasioId },
      _sum: { total:  true },
    });

    const ingresosVentas = Number(ventasProductos._sum. total || 0);

    const ventasMesActual = await this.prisma.ventaProducto.aggregate({
      where: {
        gimnasioId,
        fechaVenta: { gte: inicioMes, lte: finMes },
      },
      _sum: { total: true },
    });

    const ingresosVentasMesActual = Number(ventasMesActual._sum.total || 0);

    // Totales
    const totalIngresos = ingresosMembresias + ingresosVentas;
    const ingresosMesActual = ingresosMembresiaMesActual + ingresosVentasMesActual;

    // Asistencias del mes
    const asistenciasMesActual = await this.prisma.asistencia. count({
      where: {
        gimnasioId,
        marcaTiempo: { gte: inicioMes, lte: finMes },
      },
    });

    return {
      totalClientes,
      clientesActivos,
      totalMembresias,
      membresiasActivas,
      membresiasExpiradas,
      membresiasCanceladas,
      totalIngresos,
      ingresosMesActual,
      ingresosMembresias,
      ingresosVentas,
      ingresosMembresiaMesActual,
      ingresosVentasMesActual,
      asistenciasMesActual,
    };
  }
}