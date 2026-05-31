import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub?: string;
  userId?: string;
  email:  string;
  rol: string;
  gimnasioId?: string;
  gimnasioid?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:  false,
      secretOrKey:  configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub || payload.userId,
      email: payload.email,
      rol: payload.rol,
      gimnasioId: payload.gimnasioId || payload.gimnasioid,
    };
  }
}