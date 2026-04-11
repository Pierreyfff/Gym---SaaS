import { Inject, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { CreateInscripcionDto, InscripcionResponseDto } from '@gym-saas/shared';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';

@Injectable()
export class CreateInscripcionUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(
    dto: CreateInscripcionDto,
    gimnasioId: string,
  ): Promise<InscripcionResponseDto> {
    // 1. Validar que el cliente existe
    const clienteData = await this.clienteRepository.findById(dto.clienteId);
    if (!clienteData) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 2. Validar que el plan existe
    const planData = await this.planRepository.findById(dto.planId);
    if (!planData) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 3. Validar que no tiene membresía activa
    const membresiaActiva = await this.membresiaRepository.findActivaByCliente(dto.clienteId);
    if (membresiaActiva) {
      throw new ConflictException(
        `${clienteData.usuario.nombre} ${clienteData.usuario.apellido} ya tiene una membresía activa que vence el ${new Date(membresiaActiva.membresia.fechaFin).toLocaleDateString('es-ES')}`,
      );
    }

    // 4. Calcular fechas
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + planData.duracionDias);

    // 5. Crear membresía + pago en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear membresía
      const membresia = await tx.membresia.create({
        data: {
          gimnasioId,
          clienteId: dto.clienteId,
          planId: dto.planId,
          fechaInicio,
          fechaFin,
          estado: 'activa',
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          plan:  {
            select: {
              id: true,
              nombre:  true,
              precio: true,
              duracionDias: true,
            },
          },
        },
      });

      // Crear pago
      const pago = await tx.pago.create({
        data: {
          gimnasioId,
          membresiaId: membresia.id,
          clienteId: dto.clienteId,
          tipo: 'membresia',
          monto: planData.precio,
          metodoPago: dto.metodoPago,
          fechaPago: new Date(),
          nota: dto.notasPago,
        },
      });

      return { membresia, pago };
    });

    // 6. Retornar respuesta
    return {
      membresia: {
        id: result.membresia.id,
        fechaInicio: result.membresia.fechaInicio,
        fechaFin: result.membresia.fechaFin,
        estado: result.membresia.estado,
      },
      pago: {
        id: result.pago.id,
        monto: Number(result.pago.monto),
        metodoPago: result.pago.metodoPago,
        fechaPago: result.pago.fechaPago,
      },
      cliente: {
        id: result.membresia.cliente.id,
        nombre: result.membresia.cliente.nombre,
        apellido: result.membresia.cliente.apellido,
        email: result.membresia.cliente.email,
      },
      plan: {
        id: result.membresia.plan.id,
        nombre: result.membresia.plan.nombre,
        precio: Number(result.membresia.plan.precio),
        duracionDias:  result.membresia.plan.duracionDias,
      },
    };
  }
}