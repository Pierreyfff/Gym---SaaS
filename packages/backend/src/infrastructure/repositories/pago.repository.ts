import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import {
  IPagoRepository,
  PagoConRelaciones,
  CreatePagoData,
  UpdatePagoData,
  ReembolsarPagoData,
} from '@domain/repositories/pago.repository.interface';
import { PagoEntity } from '@domain/entities/pago.entity';

@Injectable()
export class PagoRepository implements IPagoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllByGimnasio(gimnasioId: string): Promise<PagoConRelaciones[]> {
    const pagos = await this.prisma.pago.findMany({
      where: { gimnasioId },
      include: {
        membresia: {
          include: {
            cliente: true,
            plan: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return pagos.map((p) => this.mapToPagoConRelaciones(p));
  }

  async findById(id: string): Promise<PagoConRelaciones | null> {
    const pago = await this.prisma.pago.findUnique({
      where: { id },
      include:  {
        membresia: {
          include: {
            cliente: true,
            plan: true,
          },
        },
      },
    });

    if (!pago) return null;

    return this.mapToPagoConRelaciones(pago);
  }

  async create(data: CreatePagoData): Promise<PagoConRelaciones> {
    const pago = await this.prisma.pago.create({
      data: {
        gimnasioId: data.gimnasioId,
        membresiaId:  data.membresiaId,
        clienteId: data.clienteId,
        tipo: 'membresia',
        monto: data.monto,
        metodoPago:  data.metodoPago,
        estado: 'completado',
        fechaPago: new Date(),
        nota: data.notas,
      },
      include: {
        membresia: {
          include: {
            cliente: true,
            plan: true,
          },
        },
      },
    });

    return this.mapToPagoConRelaciones(pago);
  }

  async update(id: string, data: UpdatePagoData): Promise<PagoConRelaciones> {
    const pago = await this.prisma.pago. update({
      where: { id },
      data: {
        nota: data.notas,
      },
      include: {
        membresia: {
          include: {
            cliente: true,
            plan: true,
          },
        },
      },
    });

    return this.mapToPagoConRelaciones(pago);
  }

  async reembolsar(id: string, data: ReembolsarPagoData): Promise<PagoConRelaciones> {
    // Verificar que el pago existe y puede reembolsarse
    const pagoExistente = await this. findById(id);
    
    if (!pagoExistente) {
      throw new BadRequestException('Pago no encontrado');
    }

    if (! pagoExistente.pago.puedeReembolsarse()) {
      throw new BadRequestException(
        `No se puede reembolsar un pago con estado "${pagoExistente. pago.estado}"`
      );
    }

    // Actualizar pago a reembolsado
    const pago = await this.prisma.pago.update({
      where: { id },
      data: {
        estado: 'reembolsado',
        motivoReembolso: data.motivo,
        fechaReembolso: new Date(),
        nota: data.notas || pagoExistente.pago. notas,
      },
      include: {
        membresia:  {
          include: {
            cliente: true,
            plan:  true,
          },
        },
      },
    });

    return this.mapToPagoConRelaciones(pago);
  }

  private mapToPagoConRelaciones(data: any): PagoConRelaciones {
    const pago = new PagoEntity(
      data.id,
      data.gimnasioId,
      data.membresiaId,
      data.tipo || 'membresia',
      Number(data.monto),
      data.metodoPago,
      data.estado,
      data.nota,
      data.nota,
      data.motivoReembolso,
      data.fechaReembolso,
      data.fechaCreacion,
      data.fechaPago,
    );

    return {
      pago,
      membresia:  {
        id: data.membresia.id,
        fechaInicio: data.membresia.fechaInicio,
        fechaFin: data. membresia.fechaFin,
        estado: data.membresia.estado,
        cliente: {
          id: data. membresia.cliente.id,
          nombre: data.membresia.cliente.nombre,
          apellido: data.membresia.cliente.apellido,
          email: data.membresia. cliente.email,
        },
        plan: {
          id:  data.membresia.plan. id,
          nombre: data. membresia.plan.nombre,
          precio: Number(data.membresia.plan.precio),
        },
      },
    };
  }
}