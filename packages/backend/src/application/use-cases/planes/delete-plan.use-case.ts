import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { PrismaClient } from '@gym-saas/database';

@Injectable()
export class DeletePlanUseCase {
  constructor(
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    // 1. Verificar que existe
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 2. Verificar que pertenece al gimnasio
    if (plan.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 3. Verificar que no tenga NINGUNA membresía (activa, cancelada o expirada)
    const totalMembresias = await this.prisma.membresia.count({
      where: {
        planId: id,
      },
    });

    if (totalMembresias > 0) {
      throw new BadRequestException(
        `No se puede eliminar el plan porque tiene ${totalMembresias} membresía(s) asociada(s). ` +
        'Por razones de auditoría, los planes con historial no pueden ser eliminados.'
      );
    }

    // 4. Eliminar
    await this.planRepository.delete(id);
  }
}