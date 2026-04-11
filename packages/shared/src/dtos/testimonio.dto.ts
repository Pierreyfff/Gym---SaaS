import { IsString, IsOptional, IsBoolean, IsInt, IsUrl, Min, Max } from 'class-validator';

export class CreateTestimonioDto {
  @IsString()
  nombreCliente: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion?: number;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateTestimonioDto {
  @IsOptional()
  @IsString()
  nombreCliente?: string;

  @IsOptional()
  @IsString()
  contenido?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion?: number;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class TestimonioResponseDto {
  id: string;
  gimnasioId: string;
  nombreCliente: string;
  contenido: string;
  calificacion: number;
  imagenUrl?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
}

export class ListTestimoniosResponseDto {
  testimonios: TestimonioResponseDto[];
  total: number;
}