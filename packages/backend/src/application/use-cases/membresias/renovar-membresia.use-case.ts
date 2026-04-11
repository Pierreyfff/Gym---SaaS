import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { RenovarMembresiaDto, MembresiaResponseDto } from '@gym-saas/shared';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { EmailService } from '@application/services/email.service';

@Injectable()
export class RenovarMembresiaUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    private readonly emailService: EmailService, // ← AGREGAR
  ) {}

  async execute(
    dto: RenovarMembresiaDto,
    gimnasioId: string,
  ): Promise<MembresiaResponseDto> {
    // 1. Validar que la membresía anterior existe
    const membresiaAnterior = await this.membresiaRepository.findById(
      dto.membresiaId,
    );

    if (!membresiaAnterior) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 2. Validar que pertenece al gimnasio
    if (membresiaAnterior.membresia.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 3. Validar que la membresía está expirada o cancelada
    if (membresiaAnterior.membresia.estado === 'activa') {
      throw new BadRequestException(
        'No se puede renovar una membresía activa.  Cancélala primero o espera a que expire.',
      );
    }

    // 4. Obtener el plan
    const planData = await this.planRepository.findById(dto.planId);
    if (!planData) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 5. Calcular fechas (empieza al día siguiente de la expiración)
    const fechaInicio = new Date();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + planData.duracionDias);

    // 6. Crear nueva membresía + pago en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear nueva membresía
      const nuevaMembresia = await tx.membresia.create({
        data: {
          gimnasioId,
          clienteId: membresiaAnterior.membresia.clienteId,
          planId: dto.planId,
          fechaInicio,
          fechaFin,
          estado: 'activa',
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          plan: {
            select: {
              id: true,
              nombre: true,
              precio: true,
              duracionDias: true,
            },
          },
        },
      });

      // Crear pago
      await tx.pago.create({
        data: {
          gimnasioId,
          membresiaId: nuevaMembresia.id,
          clienteId: membresiaAnterior.membresia.clienteId,
          tipo: 'membresia',
          monto: planData.precio,
          metodoPago: dto.metodoPago,
          fechaPago: new Date(),
          nota: dto.notasPago || `Renovación de membresía #${dto.membresiaId}`,
        },
      });

      return nuevaMembresia;
    });

    // 8. Enviar email de confirmación
    await this.emailService.enviarConfirmacionRenovacion(
      result.cliente.email,
      `${result.cliente.nombre} ${result.cliente.apellido}`,
      planData.nombre,
      fechaInicio,
      fechaFin,
      planData.precio,
    );

    // 7. Retornar respuesta
    return {
      id: result.id,
      gimnasioId: result.gimnasioId,
      fechaInicio: result.fechaInicio,
      fechaFin: result.fechaFin,
      estado: result.estado,
      diasRestantes: 0, // Se calculará en el entity
      cliente: {
        id: result.cliente.id,
        nombre: result.cliente.nombre,
        apellido: result.cliente.apellido,
        email: result.cliente.email,
      },
      plan: {
        id: result.plan.id,
        nombre: result.plan.nombre,
        precio: Number(result.plan.precio),
        duracionDias: result.plan.duracionDias,
      },
      fechaCreacion: result.fechaCreacion,
      fechaActualizacion: result.fechaActualizacion,
    };
  }
}
