import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export enum MetodosPago {
  EFECTIVO = 'efectivo',
  TARJETA = 'tarjeta',
  TRANSFERENCIA = 'transferencia',
}

export class CreateInscripcionDto {
  @IsString()
  clienteId: string;

  @IsString()
  planId: string;

  @IsEnum(MetodosPago)
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsOptional()
  @IsString()
  referenciaPago?: string;

  @IsOptional()
  @IsString()
  notasPago?: string;
}

export class InscripcionResponseDto {
  membresia: {
    id:  string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
  };
  pago: {
    id: string;
    monto: number;
    metodoPago: string;
    fechaPago: Date;
  };
  cliente: {
    id: string;
    nombre:  string;
    apellido: string;
    email: string;
  };
  plan: {
    id: string;
    nombre: string;
    precio: number;
    duracionDias:  number;
  };
}