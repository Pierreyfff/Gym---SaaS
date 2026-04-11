import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UpdateUserDto, UserResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateUserDto,
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

    // 3. Si se actualiza el email, verificar que no exista otro usuario con ese email
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmailAndGimnasio(
        dto.email,
        gimnasioId,
      );

      if (existingUser) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
    }

    // 4. Actualizar
    const updatedUser = await this.userRepository.update(id, dto);

    return {
      id:  updatedUser.id,
      email: updatedUser.email,
      nombre: updatedUser.nombre,
      apellido: updatedUser.apellido,
      telefono: updatedUser.telefono || undefined,
      rol: updatedUser.rol,
      estado: updatedUser.estado,
      gimnasioId: updatedUser.gimnasioId,
      fechaCreacion:  updatedUser.fechaCreacion,
      fechaActualizacion: updatedUser.fechaActualizacion,
    };
  }
}