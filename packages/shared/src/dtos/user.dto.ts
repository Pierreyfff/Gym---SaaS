import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsEnum(['admin', 'recepcionista', 'entrenador', 'cliente'])
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEnum(['admin', 'recepcionista', 'entrenador', 'cliente'])
  rol?: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
}

export class ChangeUserStatusDto {
  @IsEnum(['activo', 'inactivo'])
  estado: 'activo' | 'inactivo';
}

export class UserListResponseDto {
  users:  UserResponseDto[];
  total: number;
}

// DTO de respuesta para usuarios (sin password)
export class UserResponseDto {
  id: string;
  email: string;
  nombre:  string;
  apellido: string;
  telefono?:  string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  estado: 'activo' | 'inactivo';
  gimnasioId: string;
  fechaCreacion?:  Date;
  fechaActualizacion?: Date;
}