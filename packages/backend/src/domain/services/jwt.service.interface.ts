// Contrato para el servicio de JWT

export interface IJwtService {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  rol: string;
  gimnasioId: string;
}