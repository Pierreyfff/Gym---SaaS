import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id:  string, gimnasioId: string): Promise<void> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Verificar que pertenece al mismo gimnasio
    if (user.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 3. Eliminar
    await this.userRepository.delete(id);
  }
}