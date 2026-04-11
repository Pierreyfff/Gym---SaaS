import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import {
  IPlanRepository,
  CreatePlanData,
  UpdatePlanData,
} from '@domain/repositories/plan.repository.interface';
import { PlanEntity } from '@domain/entities/plan.entity';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllByGimnasio(gimnasioId: string): Promise<PlanEntity[]> {
    const planes = await this.prisma.plan.findMany({
      where: { gimnasioId },
      orderBy: { duracionDias: 'asc' },
    });

    return planes.map((plan) => this.mapToEntity(plan));
  }

  async findById(id: string): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) return null;

    return this.mapToEntity(plan);
  }

  async create(data: CreatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.create({
      data: {
        gimnasioId: data.gimnasioId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        duracionDias: data.duracionDias,
        precio: data.precio,
      },
    });

    return this.mapToEntity(plan);
  }

  async update(id:   string, data: UpdatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        nombre:  data.nombre,
        descripcion: data.descripcion,
        duracionDias: data.duracionDias,
        precio:  data.precio,
      },
    });

    return this.mapToEntity(plan);
  }

  async delete(id:  string): Promise<void> {
    await this.prisma.plan.delete({
      where: { id },
    });
  }

  private mapToEntity(plan: any): PlanEntity {
    return new PlanEntity(
      plan.id,
      plan.gimnasioId,
      plan.nombre,
      plan.descripcion,
      plan.duracionDias,
      Number(plan.precio), // Convertir Decimal a number
      plan.fechaCreacion,
      plan.fechaActualizacion,
    );
  }
}