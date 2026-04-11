import { IsString, IsOptional, IsBoolean, IsInt, IsUrl, Min } from 'class-validator';

export class CreateImagenGaleriaDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateImagenGaleriaDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ImagenGaleriaResponseDto {
  id: string;
  gimnasioId: string;
  url: string;
  titulo?: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  fechaCreacion: Date;
}

export class ListImagenesGaleriaResponseDto {
  imagenes: ImagenGaleriaResponseDto[];
  total: number;
}