import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { ClienteResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository:  IClienteRepository,
  ) {}

  async execute(id:  string, gimnasioId: string): Promise<ClienteResponseDto> {
    const clienteConPerfil = await this.clienteRepository.findById(id);

    if (!clienteConPerfil) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar que pertenece al gimnasio
    if (clienteConPerfil.usuario.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return {
      id: clienteConPerfil.usuario.id,
      email: clienteConPerfil.usuario.email,
      nombre: clienteConPerfil.usuario.nombre,
      apellido: clienteConPerfil.usuario.apellido,
      telefono: clienteConPerfil.usuario.telefono || undefined,
      estado: clienteConPerfil.usuario.estado,
      gimnasioId:  clienteConPerfil.usuario.gimnasioId,
      perfil: {
        fechaNacimiento: clienteConPerfil.perfil.fechaNacimiento || undefined,
        genero: clienteConPerfil.perfil.genero || undefined,
        notas: clienteConPerfil.perfil.notas || undefined,
        edad:  clienteConPerfil.perfil.calcularEdad() || undefined,
      },
      fechaCreacion: clienteConPerfil.usuario.fechaCreacion,
      fechaActualizacion: clienteConPerfil.usuario.fechaActualizacion,
    };
  }
}