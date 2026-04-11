import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { PlanResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetPlanByIdUseCase {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository:  IPlanRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<PlanResponseDto> {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    // Verificar que pertenece al gimnasio
    if (plan.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Plan no encontrado');
    }

    return {
      id: plan.id,
      gimnasioId: plan.gimnasioId,
      nombre:  plan.nombre,
      descripcion: plan.descripcion || undefined,
      duracionDias: plan.duracionDias,
      precio: plan.precio,
      fechaCreacion: plan.fechaCreacion,
      fechaActualizacion: plan.fechaActualizacion,
    };
  }
}