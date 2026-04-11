import { IsString, IsOptional, IsBoolean, IsInt, IsUUID } from 'class-validator';

export class CreateStaffDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string; // 🆕 Vincular con usuario existente

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsString()
  cargo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsInt()
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;
}

export class StaffResponseDto {
  id: string;
  gimnasioId: string;
  usuarioId?: string; // 🆕
  nombre: string;
  apellido: string;
  cargo: string;
  descripcion?: string;
  imagenUrl?: string;
  orden: number;
  activo: boolean;
  instagram?: string;
  facebook?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  
  // 🆕 Datos del usuario vinculado (si existe)
  usuario?: {
    email: string;
    telefono?: string;
    rol: string;
  };
}

export class StaffListResponseDto {
  staff: StaffResponseDto[];
  total: number;
}