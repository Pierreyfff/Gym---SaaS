import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import {
  IMembresiaRepository,
  MembresiaConRelaciones,
  CreateMembresiaData,
  UpdateMembresiaData,
} from '@domain/repositories/membresia.repository.interface';
import { MembresiaEntity } from '@domain/entities/membresia.entity';

@Injectable()
export class MembresiaRepository implements IMembresiaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllByGimnasio(gimnasioId: string): Promise<MembresiaConRelaciones[]> {
    const membresias = await this.prisma.membresia.findMany({
      where: { gimnasioId },
      include: {
        cliente: {
          select:  {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id:  true,
            nombre: true,
            precio: true,
            duracionDias: true,
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return membresias.map((m) => this.mapToMembresiaConRelaciones(m));
  }

  async findByClienteId(clienteId: string): Promise<MembresiaConRelaciones[]> {
    const membresias = await this.prisma.membresia.findMany({
      where: { clienteId },
      include:  {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id:  true,
            nombre: true,
            precio: true,
            duracionDias: true,
          },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return membresias.map((m) => this.mapToMembresiaConRelaciones(m));
  }

  async findById(id:  string): Promise<MembresiaConRelaciones | null> {
    const membresia = await this.prisma.membresia.findUnique({
      where:  { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            duracionDias: true,
          },
        },
      },
    });

    if (!membresia) return null;

    return this.mapToMembresiaConRelaciones(membresia);
  }

  async findActivaByCliente(clienteId: string): Promise<MembresiaConRelaciones | null> {
    const membresia = await this.prisma.membresia.findFirst({
      where: {
        clienteId,
        estado: 'activa',
      },
      include: {
        cliente: {
          select:  {
            id: true,
            nombre: true,
            apellido: true,
            email:  true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            duracionDias: true,
          },
        },
      },
      orderBy: { fechaFin: 'desc' },
    });

    if (!membresia) return null;

    return this.mapToMembresiaConRelaciones(membresia);
  }

  async create(data: CreateMembresiaData): Promise<MembresiaConRelaciones> {
    const membresia = await this.prisma.membresia.create({
      data:  {
        gimnasioId: data.gimnasioId,
        clienteId: data.clienteId,
        planId: data.planId,
        fechaInicio:  data.fechaInicio,
        fechaFin: data.fechaFin,
        estado: 'activa',
      },
      include: {
        cliente:  {
          select: {
            id: true,
            nombre:  true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            duracionDias:  true,
          },
        },
      },
    });

    return this.mapToMembresiaConRelaciones(membresia);
  }

  async update(id: string, data: UpdateMembresiaData): Promise<MembresiaConRelaciones> {
    const membresia = await this.prisma.membresia.update({
      where: { id },
      data: {
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        estado:  data.estado,
      },
      include: {
        cliente:  {
          select: {
            id: true,
            nombre:  true,
            apellido: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            duracionDias:  true,
          },
        },
      },
    });

    return this.mapToMembresiaConRelaciones(membresia);
  }

  async cancelar(id: string): Promise<MembresiaConRelaciones> {
    const membresia = await this.prisma.membresia.update({
      where: { id },
      data: { estado: 'cancelada' },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido:  true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            nombre: true,
            precio:  true,
            duracionDias: true,
          },
        },
      },
    });

    return this.mapToMembresiaConRelaciones(membresia);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.membresia.delete({
      where: { id },
    });
  }

  private mapToMembresiaConRelaciones(data: any): MembresiaConRelaciones {
    const membresia = new MembresiaEntity(
      data.id,
      data.gimnasioId,
      data.clienteId,
      data.planId,
      data.fechaInicio,
      data.fechaFin,
      data.estado,
      data.fechaCreacion,
      data.fechaActualizacion,
    );

    return {
      membresia,
      cliente: {
        id: data.cliente.id,
        nombre: data.cliente.nombre,
        apellido: data.cliente.apellido,
        email: data.cliente.email,
      },
      plan: {
        id: data.plan.id,
        nombre: data.plan.nombre,
        precio: Number(data.plan.precio),
        duracionDias: data.plan.duracionDias,
      },
    };
  }
}