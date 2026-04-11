import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { MembresiaResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetMembresiaByIdUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository:  IMembresiaRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<MembresiaResponseDto> {
    const membresiaConRelaciones = await this.membresiaRepository.findById(id);

    if (!membresiaConRelaciones) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // Verificar que pertenece al gimnasio
    if (membresiaConRelaciones.membresia.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    return {
      id: membresiaConRelaciones.membresia.id,
      gimnasioId:  membresiaConRelaciones.membresia.gimnasioId,
      fechaInicio: membresiaConRelaciones.membresia.fechaInicio,
      fechaFin: membresiaConRelaciones.membresia.fechaFin,
      estado: membresiaConRelaciones.membresia.estado,
      diasRestantes: membresiaConRelaciones.membresia.diasRestantes(),
      cliente: membresiaConRelaciones.cliente,
      plan: membresiaConRelaciones.plan,
      fechaCreacion: membresiaConRelaciones.membresia.fechaCreacion,
      fechaActualizacion: membresiaConRelaciones.membresia.fechaActualizacion,
    };
  }
}