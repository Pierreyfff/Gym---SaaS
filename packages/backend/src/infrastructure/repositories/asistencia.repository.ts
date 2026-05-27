import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import {
  IAsistenciaRepository,
  AsistenciaConRelaciones,
  CreateAsistenciaData,
} from '@domain/repositories/asistencia.repository.interface';
import { AsistenciaEntity } from '@domain/entities/asistencia.entity';

@Injectable()
export class AsistenciaRepository implements IAsistenciaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllByGimnasio(
    gimnasioId: string,
  ): Promise<AsistenciaConRelaciones[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: { gimnasioId },
      include: {
        cliente: true,
      },
      orderBy: {
        marcaTiempo: 'desc',
      },
    });

    return asistencias.map((a) => this.mapToAsistenciaConRelaciones(a));
  }

  async findById(id: string, gimnasioId?: string): Promise<AsistenciaConRelaciones | null> {
    const asistencia = await this.prisma.asistencia.findFirst({
      where: { id, ...(gimnasioId ? { gimnasioId } : {}) },
      include: {
        cliente: true,
      },
    });

    if (!asistencia) return null;

    return this.mapToAsistenciaConRelaciones(asistencia);
  }

  async findTodayByCliente(
    gimnasioId: string,
    clienteId: string,
  ): Promise<AsistenciaConRelaciones | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const asistencia = await this.prisma.asistencia.findFirst({
      where: {
        gimnasioId,
        clienteId,
        marcaTiempo: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        cliente: true,
      },
      orderBy: {
        marcaTiempo: 'desc',
      },
    });

    if (!asistencia) return null;

    return this.mapToAsistenciaConRelaciones(asistencia);
  }

  async findByDateRange(
    gimnasioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<AsistenciaConRelaciones[]> {
    const asistencias = await this.prisma.asistencia.findMany({
      where: {
        gimnasioId,
        marcaTiempo: {
          gte: fechaInicio,
          lt: fechaFin,
        },
      },
      include: {
        cliente: true,
      },
      orderBy: {
        marcaTiempo: 'desc',
      },
    });

    return asistencias.map((a) => this.mapToAsistenciaConRelaciones(a));
  }

  async create(data: CreateAsistenciaData): Promise<AsistenciaConRelaciones> {
    const asistencia = await this.prisma.asistencia.create({
      data: {
        gimnasioId: data.gimnasioId,
        clienteId: data.clienteId,
        marcaTiempo: data.marcaTiempo || new Date(),
      },
      include: {
        cliente: true,
      },
    });

    return this.mapToAsistenciaConRelaciones(asistencia);
  }

  async delete(id: string, gimnasioId?: string): Promise<void> {
    const where = gimnasioId ? { id, gimnasioId } : { id };
    await this.prisma.asistencia.deleteMany({
      where,
    });
  }

  private mapToAsistenciaConRelaciones(data: any): AsistenciaConRelaciones {
    const asistencia = new AsistenciaEntity(
      data.id,
      data.gimnasioId,
      data.clienteId,
      data.marcaTiempo,
      data.fechaCreacion,
    );

    return {
      asistencia,
      cliente: {
        id: data.cliente.id,
        nombre: data.cliente.nombre,
        apellido: data.cliente.apellido,
        email: data.cliente.email,
      },
    };
  }
}