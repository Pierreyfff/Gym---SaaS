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

    const { membresia } = membresiaConRelaciones;
    const estadoEfectivo: 'activa' | 'expirada' | 'cancelada' = membresia.estaActiva()
      ? 'activa'
      : membresia.estado === 'activa'
        ? 'expirada'
        : membresia.estado;

    return {
      id: membresia.id,
      gimnasioId:  membresia.gimnasioId,
      fechaInicio: membresia.fechaInicio,
      fechaFin: membresia.fechaFin,
      estado: estadoEfectivo,
      diasRestantes: membresia.diasRestantes(),
      cliente: membresiaConRelaciones.cliente,
      plan: membresiaConRelaciones.plan,
      fechaCreacion: membresia.fechaCreacion,
      fechaActualizacion: membresia.fechaActualizacion,
    };
  }
}