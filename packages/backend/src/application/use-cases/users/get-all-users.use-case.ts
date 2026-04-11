import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserListResponseDto, UserResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(gimnasioId: string): Promise<UserListResponseDto> {
    const users = await this.userRepository.findAllByGimnasio(gimnasioId);

    const userDtos:  UserResponseDto[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono || undefined,
      rol: user.rol,
      estado: user.estado,
      gimnasioId: user.gimnasioId,
      fechaCreacion: user.fechaCreacion,
      fechaActualizacion: user.fechaActualizacion,
    }));

    return {
      users: userDtos,
      total: userDtos.length,
    };
  }
}