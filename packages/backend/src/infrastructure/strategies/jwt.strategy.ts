import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email:  string;
  rol: string;
  gimnasioId: string;
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
    // El payload ya viene validado por JWT
    // Aquí podríamos hacer validaciones adicionales si queremos
    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
      gimnasioId: payload.gimnasioId,
    };
  }
}