import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { ClienteListResponseDto, ClienteResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllClientesUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ClienteListResponseDto> {
    const clientesConPerfil = await this.clienteRepository.findAllByGimnasio(gimnasioId);

    const clienteDtos: ClienteResponseDto[] = clientesConPerfil.map((cp) => ({
      id: cp.usuario.id,
      email: cp.usuario.email,
      nombre: cp.usuario.nombre,
      apellido: cp.usuario.apellido,
      telefono: cp.usuario.telefono || undefined,
      estado: cp.usuario.estado,
      gimnasioId: cp.usuario.gimnasioId,
      perfil: {
        fechaNacimiento: cp.perfil.fechaNacimiento || undefined,
        genero: cp.perfil.genero || undefined,
        notas: cp.perfil.notas || undefined,
        edad: cp.perfil.calcularEdad() || undefined,
      },
      fechaCreacion: cp.usuario.fechaCreacion,
      fechaActualizacion:  cp.usuario.fechaActualizacion,
    }));

    return {
      clientes: clienteDtos,
      total: clienteDtos.length,
    };
  }
}