import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { MembresiaListResponseDto, MembresiaResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllMembresiasUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository:  IMembresiaRepository,
  ) {}

  async execute(gimnasioId: string): Promise<MembresiaListResponseDto> {
    const membresiasConRelaciones = await this.membresiaRepository.findAllByGimnasio(gimnasioId);

    const membresiaDtos:  MembresiaResponseDto[] = membresiasConRelaciones.map((m) => {
      const estadoEfectivo = m.membresia.estaActiva()
        ? 'activa'
        : m.membresia.estado === 'activa'
          ? 'expirada'
          : m.membresia.estado;

      return {
        id: m.membresia.id,
        gimnasioId: m.membresia.gimnasioId,
        fechaInicio: m.membresia.fechaInicio,
        fechaFin:  m.membresia.fechaFin,
        estado: estadoEfectivo,
        diasRestantes: m.membresia.diasRestantes(),
        cliente: m.cliente,
        plan: m.plan,
        fechaCreacion: m.membresia.fechaCreacion,
        fechaActualizacion: m.membresia.fechaActualizacion,
      };
    });

    return {
      membresias: membresiaDtos,
      total: membresiaDtos.length,
    };
  }
}