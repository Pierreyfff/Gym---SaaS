import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { IPlanRepository } from '@domain/repositories/plan.repository.interface';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { CreateMembresiaDto, MembresiaResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
    @Inject('IPlanRepository')
    private readonly planRepository: IPlanRepository,
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CreateMembresiaDto, gimnasioId: string): Promise<MembresiaResponseDto> {
    // 1. Verificar que el cliente existe y pertenece al gimnasio
    const cliente = await this.clienteRepository.findById(dto.clienteId);
    if (!cliente || cliente.usuario.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 2. Verificar que el plan existe y pertenece al gimnasio
    const plan = await this.planRepository.findById(dto.planId);
    if (!plan || plan.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Plan no encontrado');
    }

    // 3. Verificar que el cliente no tenga una membresía activa
    const membresiaActiva = await this.membresiaRepository.findActivaByCliente(dto.clienteId);
    if (membresiaActiva) {
      throw new BadRequestException('El cliente ya tiene una membresía activa');
    }

    // 4. Calcular fecha fin
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + plan.duracionDias);

    // 5. Crear membresía
    const membresiaConRelaciones = await this.membresiaRepository.create({
      gimnasioId,
      clienteId: dto.clienteId,
      planId: dto.planId,
      fechaInicio,
      fechaFin,
    });

    return this.mapToResponseDto(membresiaConRelaciones);
  }

  private mapToResponseDto(data: any): MembresiaResponseDto {
    return {
      id: data.membresia.id,
      gimnasioId: data.membresia.gimnasioId,
      fechaInicio: data.membresia.fechaInicio,
      fechaFin:  data.membresia.fechaFin,
      estado: data.membresia.estado,
      diasRestantes: data.membresia.diasRestantes(),
      cliente: data.cliente,
      plan: data.plan,
      fechaCreacion:  data.membresia.fechaCreacion,
      fechaActualizacion: data.membresia.fechaActualizacion,
    };
  }
}