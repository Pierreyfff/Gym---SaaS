import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message:  'Password actual debe tener al menos 6 caracteres' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Nuevo password debe tener al menos 6 caracteres' })
  newPassword: string;
}

export class ResetPasswordRequestDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message:  'Password debe tener al menos 6 caracteres' })
  newPassword: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken?: string;
}

export class UserDto {
  id: string;
  email: string;
  nombre: string;
  apellido:  string;
  telefono?:  string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  estado: 'activo' | 'inactivo';
  gimnasioId: string;
}

export class RegisterClienteDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString()
  @MinLength(2, { message: 'Apellido debe tener al menos 2 caracteres' })
  apellido: string;

  @IsString()
  @MinLength(10, { message: 'Teléfono debe tener al menos 10 caracteres' })
  telefono: string;
}