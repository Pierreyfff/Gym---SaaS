import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { CambiarPlanMembresiaDto, CambiarPlanResultDto, MembresiaResponseDto } from '@gym-saas/shared';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { PrismaClient } from '@gym-saas/database';

@Injectable()
export class CambiarPlanMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(
    membresiaId: string,
    cambiarPlanDto: CambiarPlanMembresiaDto,
    gimnasioId: string,
  ): Promise<CambiarPlanResultDto> {
    const { nuevoPlanId, ajustarDuracion, generarPago, metodoPago, nota } = cambiarPlanDto;

    // 1. Obtener membresía actual
    const membresia = await this.prisma.membresia.findFirst({
      where: {
        id: membresiaId,
        gimnasioId,
      },
      include: {
        plan: true,
        cliente: true,
      },
    });

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    if (membresia.estado !== 'activa') {
      throw new BadRequestException('Solo se pueden cambiar planes de membresías activas');
    }

    // 2. Obtener nuevo plan
    const nuevoPlan = await this.prisma.plan.findFirst({
      where: {
        id: nuevoPlanId,
        gimnasioId,
      },
    });

    if (!nuevoPlan) {
      throw new NotFoundException('Plan nuevo no encontrado');
    }

    if (membresia.planId === nuevoPlanId) {
      throw new BadRequestException('El plan seleccionado es el mismo que el actual');
    }

    // 3. Calcular diferencia de precio
    const precioAnterior = Number(membresia.plan.precio);
    const precioNuevo = Number(nuevoPlan.precio);
    const diferenciaPrecio = precioNuevo - precioAnterior;

    // 4. Calcular nueva fecha de fin (si aplica)
    let nuevaFechaFin = membresia.fechaFin;

    if (ajustarDuracion) {
      const ahora = new Date();
      nuevaFechaFin = new Date(ahora);
      nuevaFechaFin.setDate(nuevaFechaFin.getDate() + nuevoPlan.duracionDias);
    }

    // 5. Actualizar membresía
    const membresiaActualizada = await this.prisma.membresia.update({
      where: { id: membresiaId },
      data: {
        planId: nuevoPlanId,
        fechaFin: nuevaFechaFin,
      },
      include: {
        plan: true,
        cliente: true,
      },
    });

    // 6. Generar pago si hay diferencia positiva y se solicita
    let pagoGenerado = null;
    let mensajeDiferencia = '';

    if (diferenciaPrecio > 0) {
      // Upgrade - cliente paga diferencia
      mensajeDiferencia = `Upgrade: se debe cobrar ${diferenciaPrecio.toFixed(2)} USD adicionales`;

      if (generarPago && metodoPago) {
        pagoGenerado = await this.prisma.pago.create({
          data: {
            gimnasioId,
            membresiaId,
            clienteId: membresia.clienteId,
            tipo: 'membresia',
            monto: diferenciaPrecio,
            metodoPago,
            estado: 'completado' as any,
            fechaPago: new Date(),
            nota: nota || `Diferencia por cambio de plan: ${membresia.plan.nombre} → ${nuevoPlan.nombre}`,
          },
        });
      }
    } else if (diferenciaPrecio < 0) {
      // Downgrade - cliente tiene crédito a favor
      mensajeDiferencia = `Downgrade: el cliente tiene ${Math.abs(diferenciaPrecio).toFixed(2)} USD a favor`;
    } else {
      mensajeDiferencia = 'Los planes tienen el mismo precio';
    }

    // 7. Calcular días restantes
    const ahora = new Date();
    const fechaFin = new Date(membresiaActualizada.fechaFin);
    const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));

    // 8. Formatear respuesta
    const membresiaResponse: MembresiaResponseDto = {
      id: membresiaActualizada.id,
      gimnasioId: membresiaActualizada.gimnasioId,
      fechaInicio: membresiaActualizada.fechaInicio,
      fechaFin: membresiaActualizada.fechaFin,
      estado: membresiaActualizada.estado,
      diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
      cliente: {
        id: membresiaActualizada.cliente.id,
        nombre: membresiaActualizada.cliente.nombre,
        apellido: membresiaActualizada.cliente.apellido,
        email: membresiaActualizada.cliente.email,
      },
      plan: {
        id: membresiaActualizada.plan.id,
        nombre: membresiaActualizada.plan.nombre,
        precio: Number(membresiaActualizada.plan.precio),
        duracionDias: membresiaActualizada.plan.duracionDias,
      },
      fechaCreacion: membresiaActualizada.fechaCreacion,
      fechaActualizacion: membresiaActualizada.fechaActualizacion,
    };

    return {
      membresiaActualizada: membresiaResponse,
      pagoGenerado,
      diferenciaPrecio,
      mensajeDiferencia,
    };
  }
}