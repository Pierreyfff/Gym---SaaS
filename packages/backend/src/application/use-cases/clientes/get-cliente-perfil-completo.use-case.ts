import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';

@Injectable()
export class GetClientePerfilCompletoUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(clienteId: string, gimnasioId: string) {
    // 1. Obtener usuario cliente con su perfil
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: clienteId,
        gimnasioId,
        rol: 'cliente',
      },
      include: {
        perfilCliente: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 2. Obtener membresías
    const membresias = await this.prisma.membresia.findMany({
      where: {
        clienteId: usuario.id,
        gimnasioId,
      },
      include: {
        plan: true,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
    });

    // 3. Obtener pagos
    const pagos = await this.prisma.pago.findMany({
      where: {
        clienteId: usuario.id,
        gimnasioId,
      },
      include: {
        membresia: {
          include: {
            plan: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    // 4. Obtener asistencias
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        clienteId: usuario.id,
        gimnasioId,
      },
      orderBy: {
        marcaTiempo: 'desc',
      },
      take: 50,
    });

    // 5. Calcular estadísticas de asistencias por mes (últimos 6 meses)
    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

    const asistenciasRecientes = await this.prisma.asistencia.findMany({
      where: {
        clienteId: usuario.id,
        gimnasioId,
        marcaTiempo: {
          gte: seiseMesesAtras,
        },
      },
      select: {
        marcaTiempo: true,
      },
    });

    // Agrupar por mes
    const asistenciasMensuales = this.agruparAsistenciasPorMes(asistenciasRecientes);

    // 6. Obtener ventas de productos (si existen)
    const ventasProductos = await this.prisma.ventaProducto.findMany({
      where: {
        clienteId: usuario.id,
        gimnasioId,
      },
      include: {
        producto: true,
      },
      orderBy: {
        fechaVenta: 'desc',
      },
    });

    // 7. Calcular resumen
    const totalPagado = pagos
      .filter((p) => p.estado === 'completado')
      .reduce((sum, p) => sum + Number(p.monto), 0);

    const totalAsistencias = asistencias.length;

    const membresiaActiva = membresias.find((m) => m.estado === 'activa');

    return {
      cliente: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        fechaNacimiento: usuario.perfilCliente?.fechaNacimiento,
        genero: usuario.perfilCliente?.genero,
        notas: usuario.perfilCliente?.notas,
        fechaCreacion: usuario.fechaCreacion,
      },
      resumen: {
        totalPagado,
        totalAsistencias,
        membresiaActiva: membresiaActiva
          ? {
              id: membresiaActiva.id,
              planNombre: membresiaActiva.plan.nombre,
              fechaInicio: membresiaActiva.fechaInicio,
              fechaFin: membresiaActiva.fechaFin,
              diasRestantes: this.calcularDiasRestantes(membresiaActiva.fechaFin),
            }
          : null,
      },
      membresias: membresias.map((m) => ({
        id: m.id,
        estado: m.estado,
        fechaInicio: m.fechaInicio,
        fechaFin: m.fechaFin,
        diasRestantes: this.calcularDiasRestantes(m.fechaFin),
        plan: {
          id: m.plan.id,
          nombre: m.plan.nombre,
          precio: Number(m.plan.precio),
          duracionDias: m.plan.duracionDias,
        },
      })),
      pagos: pagos.map((p) => ({
        id: p.id,
        tipo: p.tipo,
        monto: Number(p.monto),
        metodoPago: p.metodoPago,
        estado: p.estado,
        fechaPago: p.fechaPago,
        nota: p.nota,
        membresia: p.membresia
          ? {
              id: p.membresia.id,
              planNombre: p.membresia.plan.nombre,
            }
          : null,
      })),
      asistencias: asistencias.map((a) => ({
        id: a.id,
        fechaHora: a.marcaTiempo,
      })),
      asistenciasMensuales,
      ventasProductos: ventasProductos.map((v) => ({
        id: v.id,
        fechaVenta: v.fechaVenta,
        total: Number(v.total),
        productoNombre: v.producto.nombre,
        cantidad: v.cantidad,
        precioUnitario: Number(v.precioUnitario),
      })),
    };
  }

  private calcularDiasRestantes(fechaFin: Date): number {
    const ahora = new Date();
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - ahora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  private agruparAsistenciasPorMes(asistencias: { marcaTiempo: Date }[]): any[] {
    const mesesMap = new Map<string, number>();

    asistencias.forEach((a) => {
      const fecha = new Date(a.marcaTiempo);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      mesesMap.set(mesKey, (mesesMap.get(mesKey) || 0) + 1);
    });

    const resultado = [];
    const ahora = new Date();

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesNombre = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

      resultado.push({
        mes: mesNombre,
        cantidad: mesesMap.get(mesKey) || 0,
      });
    }

    return resultado;
  }
}