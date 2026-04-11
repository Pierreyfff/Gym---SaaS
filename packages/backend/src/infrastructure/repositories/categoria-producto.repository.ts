import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { ICategoriaProductoRepository } from '@domain/repositories/categoria-producto.repository.interface';
import {
  CreateCategoriaProductoDto,
  UpdateCategoriaProductoDto,
  CategoriaProductoResponseDto,
  CategoriaProductoListResponseDto,
} from '@gym-saas/shared';

@Injectable()
export class CategoriaProductoRepository implements ICategoriaProductoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(gimnasioId: string, dto: CreateCategoriaProductoDto): Promise<CategoriaProductoResponseDto> {
    // Validar duplicados
    const existente = await this.findByNombre(dto.nombre, gimnasioId);
    
    if (existente) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${dto.nombre}"`
      );
    }

    const categoria = await this.prisma.categoriaProducto.create({
      data: {
        gimnasioId,
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim(),
      },
    });

    return this.mapToResponse(categoria);
  }

  async findAll(gimnasioId: string): Promise<CategoriaProductoListResponseDto> {
    const categorias = await this.prisma.categoriaProducto.findMany({
      where: { gimnasioId },
      orderBy: { nombre: 'asc' },
    });

    return {
      categorias: categorias.map(this.mapToResponse),
      total: categorias.length,
    };
  }

  async findById(id: string, gimnasioId: string): Promise<CategoriaProductoResponseDto | null> {
    const categoria = await this.prisma.categoriaProducto.findFirst({
      where: { id, gimnasioId },
    });

    if (!categoria) return null;

    return this.mapToResponse(categoria);
  }

  async findByNombre(nombre: string, gimnasioId: string): Promise<CategoriaProductoResponseDto | null> {
    const categoria = await this.prisma.categoriaProducto.findFirst({
      where: {
        gimnasioId,
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!categoria) return null;

    return this.mapToResponse(categoria);
  }

  async update(
    id: string,
    gimnasioId: string,
    dto: UpdateCategoriaProductoDto,
  ): Promise<CategoriaProductoResponseDto> {
    const categoria = await this.prisma.categoriaProducto.findFirst({
      where: { id, gimnasioId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Si se actualiza el nombre, validar duplicados
    if (dto.nombre && dto.nombre.trim() !== categoria.nombre) {
      const existente = await this.findByNombre(dto.nombre, gimnasioId);
      
      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe otra categoría con el nombre "${dto.nombre}"`
        );
      }
    }

    const updated = await this.prisma.categoriaProducto.update({
      where: { id },
      data: {
        nombre: dto.nombre?.trim(),
        descripcion: dto.descripcion?.trim(),
      },
    });

    return this.mapToResponse(updated);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    const categoria = await this.prisma.categoriaProducto.findFirst({
      where: { id, gimnasioId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.prisma.categoriaProducto.delete({
      where: { id },
    });
  }

  private mapToResponse(categoria: any): CategoriaProductoResponseDto {
    return {
      id: categoria.id,
      gimnasioId: categoria.gimnasioId,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || undefined,
      fechaCreacion: categoria.fechaCreacion,
      fechaActualizacion: categoria.fechaActualizacion,
    };
  }
}