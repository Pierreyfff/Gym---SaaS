import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(1, { message: 'La duración debe ser al menos 1 día' })
  duracionDias: number;

  @IsNumber()
  @Min(0, { message: 'El precio debe ser positivo' })
  precio: number;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  duracionDias?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;
}

export class PlanResponseDto {
  id: string;
  gimnasioId: string;
  nombre: string;
  descripcion?:  string;
  duracionDias: number;
  precio: number;
  fechaCreacion? :  Date;
  fechaActualizacion?:  Date;
}

export class PlanListResponseDto {
  planes: PlanResponseDto[];
  total: number;
}