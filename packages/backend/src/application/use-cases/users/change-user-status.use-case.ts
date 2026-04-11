import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { ChangeUserStatusDto, UserResponseDto } from '@gym-saas/shared';

@Injectable()
export class ChangeUserStatusUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    id: string,
    dto:  ChangeUserStatusDto,
    gimnasioId: string,
  ): Promise<UserResponseDto> {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Verificar que pertenece al mismo gimnasio
    if (user.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 3. Cambiar estado
    const updatedUser = await this.userRepository.changeStatus(id, dto.estado);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,
      telefono: updatedUser.telefono || undefined,
      rol: updatedUser.rol,
      estado: updatedUser.estado,
      gimnasioId: updatedUser.gimnasioId,
      fechaCreacion: updatedUser.fechaCreacion,
      fechaActualizacion: updatedUser.fechaActualizacion,
    };
  }
}