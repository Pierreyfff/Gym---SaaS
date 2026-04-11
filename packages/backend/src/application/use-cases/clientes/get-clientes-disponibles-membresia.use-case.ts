import { Injectable, Inject } from '@nestjs/common';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { ClienteListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetClientesDisponiblesMembresiaUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ClienteListResponseDto> {
    // 1. Obtener todos los clientes del gimnasio
    const todosLosClientes = await this.clienteRepository.findAllByGimnasio(gimnasioId);

    // 2. Obtener todas las membresías activas
    const membresiasActivas = await this.membresiaRepository.findAllByGimnasio(gimnasioId);
    
    const clientesConMembresiaActiva = new Set(
      membresiasActivas
        .filter((m) => m.membresia.estado === 'activa')
        .map((m) => m.cliente.id)
    );

    // 3. Filtrar clientes sin membresía activa
    const clientesDisponibles = todosLosClientes.filter(
      (clienteConPerfil) => !clientesConMembresiaActiva.has(clienteConPerfil.usuario.id)
    );

    // 4. Mapear a ClienteResponseDto
    const clientesMapeados = clientesDisponibles.map((c) => ({
      id: c.usuario.id,
      email: c.usuario.email,
      nombre: c.usuario.nombre,
      apellido: c.usuario.apellido,
      telefono: c.usuario.telefono || undefined,
      estado: c.usuario.estado,
      gimnasioId: c.usuario.gimnasioId,
      perfil: c.perfil
        ? {
            fechaNacimiento: c.perfil.fechaNacimiento || undefined,
            genero: c.perfil.genero || undefined,
            notas: c.perfil.notas || undefined,
            edad: c.perfil.calcularEdad() || undefined,
          }
        : undefined,
      fechaCreacion: c.usuario.fechaCreacion,
      fechaActualizacion: c.usuario.fechaActualizacion,
    }));

    return {
      clientes: clientesMapeados,
      total: clientesMapeados.length,
    };
  }
}