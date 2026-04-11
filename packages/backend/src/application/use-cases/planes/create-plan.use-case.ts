import { Injectable, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { CreatePlanDto, PlanResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(dto: CreatePlanDto, gimnasioId: string): Promise<PlanResponseDto> {
    // 1. Verificar que no exista un plan con el mismo nombre y duración
    const planesExistentes = await this. planRepository.findAllByGimnasio(gimnasioId);
    
    const planDuplicado = planesExistentes.find(
      (p) => 
        p.nombre.toLowerCase().trim() === dto.nombre.toLowerCase().trim() &&
        p.duracionDias === dto.duracionDias
    );

    if (planDuplicado) {
      throw new ConflictException(
        `Ya existe un plan llamado "${dto.nombre}" con duración de ${dto.duracionDias} días`
      );
    }

    // 2. Crear el plan
    const plan = await this.planRepository.create({
      gimnasioId,
      nombre:  dto.nombre. trim(),
      descripcion: dto.descripcion?. trim(),
      duracionDias: dto.duracionDias,
      precio: dto.precio,
    });

    return {
      id: plan.id,
      gimnasioId:  plan.gimnasioId,
      nombre: plan.nombre,
      descripcion: plan.descripcion || undefined,
      duracionDias: plan.duracionDias,
      precio: plan.precio,
      fechaCreacion: plan.fechaCreacion,
      fechaActualizacion: plan.fechaActualizacion,
    };
  }
}