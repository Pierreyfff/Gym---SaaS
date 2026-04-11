import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import {
  CreateProductoDto,
  UpdateProductoDto,
  ProductoResponseDto,
  ProductoListResponseDto,
} from '@gym-saas/shared';

@Injectable()
export class ProductoRepository implements IProductoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(gimnasioId: string, dto: CreateProductoDto): Promise<ProductoResponseDto> {
    // Validar duplicados
    const existente = await this.findByNombre(dto.nombre, gimnasioId);
    
    if (existente) {
      throw new ConflictException(
        `Ya existe un producto con el nombre "${dto.nombre}"`
      );
    }

    const producto = await this.prisma.producto.create({
      data: {
        gimnasioId,
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion?.trim(),
        precio: dto.precio,
        stock: dto.stock,
        stockMinimo: dto.stockMinimo,
        categoriaId: dto.categoriaId,
        imagenUrl: dto.imagenUrl?.trim(),
        estado: 'activo',
      },
      include: {
        categoria: true,
      },
    });

    return this.mapToResponse(producto);
  }

  async findAll(gimnasioId: string): Promise<ProductoListResponseDto> {
    const productos = await this.prisma.producto.findMany({
      where: { gimnasioId },
      include: {
        categoria: true,
      },
      orderBy: { nombre: 'asc' },
    });

    return {
      productos: productos.map(this.mapToResponse),
      total: productos.length,
    };
  }

  async findById(id: string, gimnasioId: string): Promise<ProductoResponseDto | null> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, gimnasioId },
      include: {
        categoria: true,
      },
    });

    if (!producto) return null;

    return this.mapToResponse(producto);
  }

  async findByNombre(nombre: string, gimnasioId: string): Promise<ProductoResponseDto | null> {
    const producto = await this.prisma.producto.findFirst({
      where: {
        gimnasioId,
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive',
        },
      },
      include: {
        categoria: true,
      },
    });

    if (!producto) return null;

    return this.mapToResponse(producto);
  }

  async update(id: string, gimnasioId: string, dto: UpdateProductoDto): Promise<ProductoResponseDto> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, gimnasioId },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Si se actualiza el nombre, validar duplicados
    if (dto.nombre && dto.nombre.trim() !== producto.nombre) {
      const existente = await this.findByNombre(dto.nombre, gimnasioId);
      
      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe otro producto con el nombre "${dto.nombre}"`
        );
      }
    }

    const updated = await this.prisma.producto.update({
      where: { id },
      data: {
        nombre: dto.nombre?.trim(),
        descripcion: dto.descripcion?.trim(),
        precio: dto.precio,
        stock: dto.stock,
        stockMinimo: dto.stockMinimo,
        categoriaId: dto.categoriaId,
        imagenUrl: dto.imagenUrl?.trim(),
        estado: dto.estado,
      },
      include: {
        categoria: true,
      },
    });

    return this.mapToResponse(updated);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, gimnasioId },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    await this.prisma.producto.delete({
      where: { id },
    });
  }

  async updateStock(id: string, cantidad: number): Promise<void> {
    await this.prisma.producto.update({
      where: { id },
      data: {
        stock: {
          increment: cantidad,
        },
      },
    });
  }

  async findLowStock(gimnasioId: string): Promise<ProductoResponseDto[]> {
    const productos = await this.prisma.producto.findMany({
      where: {
        gimnasioId,
        stock: {
          lte: this.prisma.producto.fields.stockMinimo,
        },
      },
      include: {
        categoria: true,
      },
    });

    return productos.map(this.mapToResponse);
  }

  private mapToResponse(producto: any): ProductoResponseDto {
    return {
      id: producto.id,
      gimnasioId: producto.gimnasioId,
      nombre: producto.nombre,
      descripcion: producto.descripcion || undefined,
      precio: Number(producto.precio),
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
      imagenUrl: producto.imagenUrl || undefined,
      estado: producto.estado,
      categoria: producto.categoria
        ? {
            id: producto.categoria.id,
            nombre: producto.categoria.nombre,
          }
        : undefined,
      fechaCreacion: producto.fechaCreacion,
      fechaActualizacion: producto.fechaActualizacion,
    };
  }
}