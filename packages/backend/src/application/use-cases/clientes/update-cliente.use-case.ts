import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { UpdateClienteDto, ClienteResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateClienteDto,
    gimnasioId: string,
  ): Promise<ClienteResponseDto> {
    // 1. Verificar que existe
    const clienteExistente = await this.clienteRepository.findById(id);

    if (!clienteExistente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 2. Verificar que pertenece al gimnasio
    if (clienteExistente.usuario.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 3. Preparar datos
    const userData = {
      email: dto.email,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
    };

    const perfilData = {
      fechaNacimiento: dto.fechaNacimiento ?  new Date(dto.fechaNacimiento) : undefined,
      genero: dto.genero,
      notas: dto.notas,
    };

    // 4. Actualizar
    const clienteActualizado = await this.clienteRepository.update(id, userData, perfilData);

    return {
      id: clienteActualizado.usuario.id,
      email: clienteActualizado.usuario.email,
      nombre: clienteActualizado.usuario.nombre,
      apellido: clienteActualizado.usuario.apellido,
      telefono:  clienteActualizado.usuario.telefono || undefined,
      estado: clienteActualizado.usuario.estado,
      gimnasioId: clienteActualizado.usuario.gimnasioId,
      perfil: {
        fechaNacimiento: clienteActualizado.perfil.fechaNacimiento || undefined,
        genero: clienteActualizado.perfil.genero || undefined,
        notas: clienteActualizado.perfil.notas || undefined,
        edad: clienteActualizado.perfil.calcularEdad() || undefined,
      },
      fechaCreacion: clienteActualizado.usuario.fechaCreacion,
      fechaActualizacion: clienteActualizado.usuario.fechaActualizacion,
    };
  }
}