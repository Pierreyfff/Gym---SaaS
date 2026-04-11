import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { ChangePasswordDto } from '@gym-saas/shared';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<void> {
    // 1. Obtener usuario
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.contrasenaHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // 3. Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // 4. Actualizar contraseña
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }
}