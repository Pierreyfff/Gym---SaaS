import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IJwtService } from '@domain/services/jwt.service.interface';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { RefreshTokenDto, RefreshTokenResponseDto } from '@gym-saas/shared';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly nestJwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    try {
      // 1. Verificar el refresh token
      const payload = this.nestJwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2. Verificar que el usuario todavía existe y está activo
      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      if (!user.estaActivo()) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      // 3. Generar nuevo access token
      const newPayload = {
        sub: user.id,
        email: user.email,
        rol: user.rol,
        gimnasioId: user.gimnasioId,
      };

      const accessToken = await this.jwtService.generateAccessToken(newPayload);

      return {
        accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}