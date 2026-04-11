import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsDateString,
} from 'class-validator';

export class CreateClienteDto {
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

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['masculino', 'femenino', 'otro'])
  genero?: 'masculino' | 'femenino' | 'otro';

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateClienteDto {
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
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['masculino', 'femenino', 'otro'])
  genero?: 'masculino' | 'femenino' | 'otro';

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ClienteResponseDto {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: string;
  gimnasioId: string;
  perfil?: {
    fechaNacimiento?: Date;
    genero?: string;
    notas?: string;
    edad?: number;
  };
  advertencia?: {
    // ← AGREGAR
    tipo: string;
    mensaje: string;
    clienteExistenteId?: string;
  };
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class ClienteListResponseDto {
  clientes: ClienteResponseDto[];
  total: number;
}
