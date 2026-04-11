import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { PlanListResponseDto, PlanResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllPlanesUseCase {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(gimnasioId: string): Promise<PlanListResponseDto> {
    const planes = await this.planRepository.findAllByGimnasio(gimnasioId);

    const planDtos:  PlanResponseDto[] = planes.map((plan) => ({
      id: plan.id,
      gimnasioId: plan.gimnasioId,
      nombre: plan.nombre,
      descripcion: plan.descripcion || undefined,
      duracionDias: plan.duracionDias,
      precio:  plan.precio,
      fechaCreacion: plan.fechaCreacion,
      fechaActualizacion: plan.fechaActualizacion,
    }));

    return {
      planes:  planDtos,
      total:  planDtos.length,
    };
  }
}