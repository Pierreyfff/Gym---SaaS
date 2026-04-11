import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { MembresiaResponseDto } from '@gym-saas/shared';
import { PrismaClient } from '@gym-saas/database';

@Injectable()
export class CancelarMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository:  IMembresiaRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<MembresiaResponseDto> {
    // 1. Verificar que existe
    const membresia = await this.membresiaRepository.findById(id);

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 2. Verificar que pertenece al gimnasio
    if (membresia.membresia.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 3. Verificar que está activa
    if (membresia.membresia.estado !== 'activa') {
      throw new BadRequestException(
        `No se puede cancelar una membresía con estado "${membresia.membresia.estado}"`
      );
    }

    // 4. Verificar si hay pagos completados asociados
    const pagosCompletados = await this.prisma.pago.findMany({
      where: {
        membresiaId: id,
        estado: 'completado',
      },
    });

    if (pagosCompletados.length > 0) {
      throw new BadRequestException(
        `Esta membresía tiene ${pagosCompletados.length} pago(s) completado(s). Para cancelarla, primero debes reembolsar todos los pagos asociados.`
      );
    }

    // 5. Cancelar membresía
    const membresiaCancelada = await this.membresiaRepository.cancelar(id);

    return {
      id: membresiaCancelada.membresia.id,
      gimnasioId:  membresiaCancelada.membresia.gimnasioId,
      fechaInicio: membresiaCancelada.membresia.fechaInicio,
      fechaFin: membresiaCancelada. membresia.fechaFin,
      estado: membresiaCancelada.membresia. estado,
      diasRestantes: membresiaCancelada.membresia.diasRestantes(),
      cliente: membresiaCancelada.cliente,
      plan: membresiaCancelada.plan,
      fechaCreacion: membresiaCancelada.membresia.fechaCreacion,
      fechaActualizacion: membresiaCancelada.membresia. fechaActualizacion,
    };
  }
}