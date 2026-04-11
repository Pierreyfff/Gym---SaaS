import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que pertenece al mismo gimnasio
    if (user.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono:  user.telefono || undefined,
      rol: user.rol,
      estado: user.estado,
      gimnasioId: user.gimnasioId,
      fechaCreacion: user.fechaCreacion,
      fechaActualizacion: user.fechaActualizacion,
    };
  }
}