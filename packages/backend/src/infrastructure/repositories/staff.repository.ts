import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IStaffRepository } from '@domain/repositories/staff.repository.interface';
import { CreateStaffDto, UpdateStaffDto, StaffResponseDto } from '@gym-saas/shared';

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(gimnasioId: string, dto: CreateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.create({
      data: {
        gimnasioId,
        usuarioId: dto.usuarioId,
        nombre: dto.nombre,
        apellido: dto.apellido,
        cargo: dto.cargo,
        descripcion: dto.descripcion,
        imagenUrl: dto.imagenUrl,
        orden: dto.orden ?? 0,
        activo: dto.activo ?? true,
        instagram: dto.instagram,
        facebook: dto.facebook,
      },
      include: {
        usuario: {
          select: {
            email: true,
            telefono: true,
            rol: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return this.mapToDto(staff);
  }

  async findAll(gimnasioId: string): Promise<StaffResponseDto[]> {
    const staff = await this.prisma.staff.findMany({
      where: { gimnasioId },
      include: {
        usuario: {
          select: {
            email: true,
            telefono: true,
            rol: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: [{ orden: 'asc' }, { fechaCreacion: 'desc' }],
    });

    return staff.map((s) => this.mapToDto(s));
  }

  async findById(id: string, gimnasioId: string): Promise<StaffResponseDto | null> {
    const staff = await this.prisma.staff.findFirst({
      where: { id, gimnasioId },
      include: {
        usuario: {
          select: {
            email: true,
            telefono: true,
            rol: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return staff ? this.mapToDto(staff) : null;
  }

  async update(id: string, gimnasioId: string, dto: UpdateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.prisma.staff.update({
      where: { id, gimnasioId },
      data: {
        usuarioId: dto.usuarioId,
        nombre: dto.nombre,
        apellido: dto.apellido,
        cargo: dto.cargo,
        descripcion: dto.descripcion,
        imagenUrl: dto.imagenUrl,
        orden: dto.orden,
        activo: dto.activo,
        instagram: dto.instagram,
        facebook: dto.facebook,
      },
      include: {
        usuario: {
          select: {
            email: true,
            telefono: true,
            rol: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    });

    return this.mapToDto(staff);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    await this.prisma.staff.delete({
      where: { id, gimnasioId },
    });
  }

  private mapToDto(staff: any): StaffResponseDto {
    return {
      id: staff.id,
      gimnasioId: staff.gimnasioId,
      usuarioId: staff.usuarioId ?? undefined,
      // Si está vinculado a usuario, usar sus datos; si no, usar campos propios
      nombre: staff.usuarioId && staff.usuario ? staff.usuario.nombre : staff.nombre!,
      apellido: staff.usuarioId && staff.usuario ? staff.usuario.apellido : staff.apellido!,
      cargo: staff.cargo,
      descripcion: staff.descripcion ?? undefined,
      imagenUrl: staff.imagenUrl ?? undefined,
      orden: staff.orden,
      activo: staff.activo,
      instagram: staff.instagram ?? undefined,
      facebook: staff.facebook ?? undefined,
      fechaCreacion: staff.fechaCreacion,
      fechaActualizacion: staff.fechaActualizacion,
      usuario:
        staff.usuarioId && staff.usuario
          ? {
              email: staff.usuario.email,
              telefono: staff.usuario.telefono ?? undefined,
              rol: staff.usuario.rol,
            }
          : undefined,
    };
  }
}