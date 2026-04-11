import { Injectable, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { CreateUserDto, UserResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto, gimnasioId: string): Promise<UserResponseDto> {
    // 1. Validar que no exista un usuario con ese email en el gimnasio
    const existingUser = await this.userRepository.findByEmailAndGimnasio(
      dto.email,
      gimnasioId,
    );

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese email en este gimnasio');
    }

    // 2. Hashear la contraseña
    const contrasenaHash = await bcrypt.hash(dto.password, 10);

    // 3. Crear usuario
    const user = await this.userRepository.create({
      gimnasioId,
      email:  dto.email,
      contrasenaHash,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      rol: dto.rol,
    });

    // 4. Retornar DTO
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono || undefined,
      rol: user.rol,
      estado: user.estado,
      gimnasioId:  user.gimnasioId,
      fechaCreacion: user.fechaCreacion,
      fechaActualizacion: user.fechaActualizacion,
    };
  }
}