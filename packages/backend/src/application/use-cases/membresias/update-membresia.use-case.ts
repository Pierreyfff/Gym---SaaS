import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { UpdateMembresiaDto, MembresiaResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateMembresiaDto,
    gimnasioId: string,
  ): Promise<MembresiaResponseDto> {
    // 1. Verificar que existe
    const membresiaExistente = await this.membresiaRepository.findById(id);

    if (!membresiaExistente) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 2. Verificar que pertenece al gimnasio
    if (membresiaExistente.membresia.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 3. Preparar datos
    const updateData = {
      fechaInicio: dto.fechaInicio ?  new Date(dto.fechaInicio) : undefined,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      estado: dto.estado,
    };

    // 4. Actualizar
    const membresiaActualizada = await this.membresiaRepository.update(id, updateData);

    return {
      id: membresiaActualizada.membresia.id,
      gimnasioId:  membresiaActualizada.membresia.gimnasioId,
      fechaInicio: membresiaActualizada.membresia.fechaInicio,
      fechaFin: membresiaActualizada.membresia.fechaFin,
      estado: membresiaActualizada.membresia.estado,
      diasRestantes: membresiaActualizada.membresia.diasRestantes(),
      cliente: membresiaActualizada.cliente,
      plan: membresiaActualizada.plan,
      fechaCreacion: membresiaActualizada.membresia.fechaCreacion,
      fechaActualizacion: membresiaActualizada.membresia.fechaActualizacion,
    };
  }
}