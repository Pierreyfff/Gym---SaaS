import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { ITestimonioRepository } from '@domain/repositories/testimonio.repository.interface';
import { CreateTestimonioDto, UpdateTestimonioDto, TestimonioResponseDto } from '@gym-saas/shared';

@Injectable()
export class TestimonioRepository implements ITestimonioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(gimnasioId: string, dto: CreateTestimonioDto): Promise<TestimonioResponseDto> {
    const testimonio = await this.prisma.testimonio.create({
      data: {
        gimnasioId,
        calificacion: dto.calificacion || 5,
        ...dto,
      },
    });

    return this.mapToDto(testimonio);
  }

  async findAll(gimnasioId: string): Promise<TestimonioResponseDto[]> {
    const testimonios = await this.prisma.testimonio.findMany({
      where: { gimnasioId },
      orderBy: [{ orden: 'asc' }, { fechaCreacion: 'desc' }],
    });

    return testimonios.map((t) => this.mapToDto(t));
  }

  async findById(id: string, gimnasioId: string): Promise<TestimonioResponseDto | null> {
    const testimonio = await this.prisma.testimonio.findFirst({
      where: { id, gimnasioId },
    });

    return testimonio ? this.mapToDto(testimonio) : null;
  }

  async update(id: string, gimnasioId: string, dto: UpdateTestimonioDto): Promise<TestimonioResponseDto> {
    const testimonio = await this.prisma.testimonio.update({
      where: { id, gimnasioId },
      data: dto,
    });

    return this.mapToDto(testimonio);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    await this.prisma.testimonio.delete({
      where: { id, gimnasioId },
    });
  }

  private mapToDto(testimonio: any): TestimonioResponseDto {
    return {
      id: testimonio.id,
      gimnasioId: testimonio.gimnasioId,
      nombreCliente: testimonio.nombreCliente,
      contenido: testimonio.contenido,
      calificacion: testimonio.calificacion,
      imagenUrl: testimonio.imagenUrl || undefined,
      orden: testimonio.orden,
      activo: testimonio.activo,
      fechaCreacion: testimonio.fechaCreacion,
    };
  }
}