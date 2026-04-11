import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';

export enum TipoPago {
  MEMBRESIA = 'membresia',
  PRODUCTO = 'producto',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
}

export enum EstadoPago {
  COMPLETADO = 'completado',
  PENDIENTE = 'pendiente',
  REEMBOLSADO = 'reembolsado',
  RECHAZADO = 'rechazado',
}

export class CreatePagoDto {
  @IsString()
  membresiaId: string;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsEnum(MetodoPago)
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ReembolsarPagoDto {
  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdatePagoDto {
  @IsOptional()
  @IsString()
  notas?: string;
}

export class PagoResponseDto {
  id: string;
  gimnasioId: string;
  tipo: 'membresia' | 'producto';
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: string;
  referencia?: string;
  notas?: string;
  motivoReembolso?: string;
  fechaReembolso?: Date;
  membresia:  {
    id: string;
    fechaInicio: Date;
    fechaFin: Date;
    cliente: {
      id: string;
      nombre: string;
      apellido: string;
      email:  string;
    };
    plan: {
      id: string;
      nombre:  string;
      precio: number;
    };
  };
  fechaCreacion?:  Date;
  fechaActualizacion?: Date;
}

export class PagoListResponseDto {
  pagos: PagoResponseDto[];
  total: number;
  totalIngresos: number;
}