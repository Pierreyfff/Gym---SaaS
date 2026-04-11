import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IImagenGaleriaRepository } from '@domain/repositories/imagen-galeria.repository.interface';
import { CreateImagenGaleriaDto, UpdateImagenGaleriaDto, ImagenGaleriaResponseDto } from '@gym-saas/shared';

@Injectable()
export class ImagenGaleriaRepository implements IImagenGaleriaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(gimnasioId: string, dto: CreateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    const imagen = await this.prisma.imagenGaleria.create({
      data: {
        gimnasioId,
        ...dto,
      },
    });

    return this.mapToDto(imagen);
  }

  async findAll(gimnasioId: string): Promise<ImagenGaleriaResponseDto[]> {
    const imagenes = await this.prisma.imagenGaleria.findMany({
      where: { gimnasioId },
      orderBy: [{ orden: 'asc' }, { fechaCreacion: 'desc' }],
    });

    return imagenes.map((img) => this.mapToDto(img));
  }

  async findById(id: string, gimnasioId: string): Promise<ImagenGaleriaResponseDto | null> {
    const imagen = await this.prisma.imagenGaleria.findFirst({
      where: { id, gimnasioId },
    });

    return imagen ? this.mapToDto(imagen) : null;
  }

  async update(id: string, gimnasioId: string, dto: UpdateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    const imagen = await this.prisma.imagenGaleria.update({
      where: { id, gimnasioId },
      data: dto,
    });

    return this.mapToDto(imagen);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    await this.prisma.imagenGaleria.delete({
      where: { id, gimnasioId },
    });
  }

  private mapToDto(imagen: any): ImagenGaleriaResponseDto {
    return {
      id: imagen.id,
      gimnasioId: imagen.gimnasioId,
      url: imagen.url,
      titulo: imagen.titulo || undefined,
      descripcion: imagen.descripcion || undefined,
      orden: imagen.orden,
      activo: imagen.activo,
      fechaCreacion: imagen.fechaCreacion,
    };
  }
}