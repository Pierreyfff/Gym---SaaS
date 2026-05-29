import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IHorarioEmpleadoRepository } from '@domain/repositories/horario-empleado.repository.interface';
import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
  HorarioEmpleadoResponseDto,
  HorarioEmpleadoListResponseDto,
} from '@gym-saas/shared';

@Injectable()
export class HorarioEmpleadoRepository implements IHorarioEmpleadoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    gimnasioId: string,
    dto: CreateHorarioEmpleadoDto,
  ): Promise<HorarioEmpleadoResponseDto> {
    const horario = await this.prisma.horarioEmpleado.create({
      data: {
        gimnasioId,
        usuarioId: dto.usuarioId,
        diaSemana: dto.diaSemana,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        activo: dto.activo ?? true,
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    });

    return this.mapToDto(horario);
  }

  async findAll(
    gimnasioId: string,
    usuarioId?: string,
  ): Promise<HorarioEmpleadoListResponseDto> {
    const horarios = await this.prisma.horarioEmpleado.findMany({
      where: {
        gimnasioId,
        ...(usuarioId ? { usuarioId } : {}),
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
      orderBy: [
        { usuarioId: 'asc' },
        { diaSemana: 'asc' },
      ],
    });

    return {
      horarios: horarios.map((h) => this.mapToDto(h)),
      total: horarios.length,
    };
  }

  async findById(
    id: string,
    gimnasioId: string,
  ): Promise<HorarioEmpleadoResponseDto | null> {
    const horario = await this.prisma.horarioEmpleado.findFirst({
      where: { id, gimnasioId },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    });

    if (!horario) return null;
    return this.mapToDto(horario);
  }

  async update(
    id: string,
    gimnasioId: string,
    dto: UpdateHorarioEmpleadoDto,
  ): Promise<HorarioEmpleadoResponseDto> {
    const existing = await this.prisma.horarioEmpleado.findFirst({
      where: { id, gimnasioId },
    });

    if (!existing) {
      throw new NotFoundException('Horario no encontrado');
    }

    const horario = await this.prisma.horarioEmpleado.update({
      where: { id },
      data: {
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        activo: dto.activo,
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    });

    return this.mapToDto(horario);
  }

  async delete(id: string, gimnasioId: string): Promise<void> {
    const existing = await this.prisma.horarioEmpleado.findFirst({
      where: { id, gimnasioId },
    });

    if (!existing) {
      throw new NotFoundException('Horario no encontrado');
    }

    await this.prisma.horarioEmpleado.delete({ where: { id } });
  }

  async findByUsuarioAndDia(
    gimnasioId: string,
    usuarioId: string,
    diaSemana: number,
  ): Promise<HorarioEmpleadoResponseDto | null> {
    const horario = await this.prisma.horarioEmpleado.findUnique({
      where: {
        gimnasioId_usuarioId_diaSemana: {
          gimnasioId,
          usuarioId,
          diaSemana,
        },
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellido: true, rol: true },
        },
      },
    });

    if (!horario) return null;
    return this.mapToDto(horario);
  }

  private mapToDto(horario: any): HorarioEmpleadoResponseDto {
    return {
      id: horario.id,
      gimnasioId: horario.gimnasioId,
      usuarioId: horario.usuarioId,
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      activo: horario.activo,
      fechaCreacion: horario.fechaCreacion,
      fechaActualizacion: horario.fechaActualizacion,
      usuario: horario.usuario
        ? {
            id: horario.usuario.id,
            nombre: horario.usuario.nombre,
            apellido: horario.usuario.apellido,
            rol: horario.usuario.rol,
          }
        : undefined,
    };
  }
}
