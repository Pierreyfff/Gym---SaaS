import { IsString, IsOptional } from 'class-validator';

export class CreateCategoriaProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateCategoriaProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CategoriaProductoResponseDto {
  id: string;
  gimnasioId: string;
  nombre:  string;
  descripcion?: string;
  fechaCreacion:  Date;
  fechaActualizacion: Date;
}

export class CategoriaProductoListResponseDto {
  categorias:  CategoriaProductoResponseDto[];
  total: number;
}