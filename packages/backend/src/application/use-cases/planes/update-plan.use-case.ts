import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { UpdatePlanDto, PlanResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdatePlanUseCase {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdatePlanDto,
    gimnasioId: string,
  ): Promise<PlanResponseDto> {
    // 1. Verificar que existe
    const planExistente = await this.planRepository.findById(id);

    if (!planExistente) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 2. Verificar que pertenece al gimnasio
    if (planExistente.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 3. Si se actualiza nombre o duración, validar duplicados
    if (dto.nombre || dto.duracionDias) {
      const nombreFinal = (dto.nombre || planExistente.nombre).toLowerCase().trim();
      const duracionFinal = dto.duracionDias || planExistente.duracionDias;

      const planesExistentes = await this.planRepository.findAllByGimnasio(gimnasioId);

      const planDuplicado = planesExistentes.find(
        (p) =>
          p.id !== id &&
          p.nombre.toLowerCase().trim() === nombreFinal &&
          p.duracionDias === duracionFinal
      );

      if (planDuplicado) {
        throw new ConflictException(
          `Ya existe otro plan llamado "${dto.nombre || planExistente.nombre}" con duración de ${duracionFinal} días`
        );
      }
    }

    // 4. Actualizar
    const planActualizado = await this.planRepository.update(id, {
      nombre: dto.nombre?.trim(),
      descripcion: dto.descripcion?.trim(),
      duracionDias: dto.duracionDias,
      precio: dto.precio,
    });

    return {
      id: planActualizado.id,
      gimnasioId: planActualizado.gimnasioId,
      nombre: planActualizado.nombre,
      descripcion: planActualizado.descripcion || undefined,
      duracionDias: planActualizado.duracionDias,
      precio: planActualizado.precio,
      fechaCreacion: planActualizado.fechaCreacion,
      fechaActualizacion: planActualizado.fechaActualizacion,
    };
  }
}