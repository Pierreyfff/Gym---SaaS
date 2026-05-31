import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { MembresiaResponseDto } from '@gym-saas/shared';

@Injectable()
export class CancelarMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository:  IMembresiaRepository,
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

    // 3. Verificar que está realmente activa (no vencida en fecha)
    if (!membresia.membresia.estaActiva()) {
      throw new BadRequestException(
        `No se puede cancelar una membresía con estado "${membresia.membresia.estado}" y fecha de fin vencida`
      );
    }

    // 4. Cancelar membresía (los pagos previos quedan intactos)
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