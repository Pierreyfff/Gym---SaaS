import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IJwtService } from '@domain/services/jwt.service.interface';
import { LoginDto, LoginResponseDto, UserDto } from '@gym-saas/shared';
import { Inject } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Validar que los campos requeridos existan
    if (!loginDto.email || !loginDto.password) {
      throw new UnauthorizedException('Datos incompletos');
    }

    // 1. Buscar usuario por email (sin gimnasio porque puede haber emails repetidos en diferentes gimnasios)
    // Necesitamos buscar de otra forma
    const usuario = await this.prisma.usuario.findFirst({
      where: { 
        email: loginDto.email 
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      usuario.contrasenaHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 4. Generar tokens
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      gimnasioId: usuario.gimnasioId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(payload),
      this.jwtService.generateRefreshToken(payload),
    ]);

    // 5. Mapear a DTO de respuesta
    const userDto: UserDto = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono || undefined,
      rol: usuario.rol,
      estado: usuario.estado,
      gimnasioId:  usuario.gimnasioId,
    };

    return {
      accessToken,
      refreshToken,
      user: userDto,
    };
  }
}