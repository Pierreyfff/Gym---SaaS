import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';

@Injectable()
export class DeleteClienteUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    // 1. Verificar que existe
    const cliente = await this.clienteRepository.findById(id);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 2. Verificar que pertenece al gimnasio
    if (cliente.usuario.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 3. Eliminar (Prisma eliminará el perfil automáticamente por CASCADE)
    await this.clienteRepository.delete(id);
  }
}