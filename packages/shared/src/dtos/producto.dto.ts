import { IsString, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  stockMinimo: number;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class ProductoResponseDto {
  id: string;
  gimnasioId: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  imagenUrl?: string;
  estado: string;
  categoria?: {
    id: string;
    nombre: string;
  };
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class ProductoListResponseDto {
  productos: ProductoResponseDto[];
  total: number;
}