import { IsString, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateMembresiaDto {
  @IsString()
  clienteId: string;

  @IsString()
  planId: string;

  @IsDateString()
  fechaInicio: string;
}

export class RenovarMembresiaDto {
  @IsString()
  membresiaId: string;

  @IsString()
  planId: string;

  @IsEnum(['efectivo', 'tarjeta', 'transferencia'])
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsOptional()
  @IsString()
  referenciaPago?: string;

  @IsOptional()
  @IsString()
  notasPago?: string;
}

export class CambiarPlanMembresiaDto {
  @IsString()
  nuevoPlanId: string;

  @IsBoolean()
  ajustarDuracion: boolean;

  @IsBoolean()
  generarPago: boolean;

  @IsOptional()
  @IsEnum(['efectivo', 'tarjeta', 'transferencia'])
  metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia';

  @IsOptional()
  @IsString()
  nota?: string;
}

export class UpdateMembresiaDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsEnum(['activa', 'expirada', 'cancelada'])
  estado?: 'activa' | 'expirada' | 'cancelada';
}

export class MembresiaResponseDto {
  id: string;
  gimnasioId: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'activa' | 'expirada' | 'cancelada';
  diasRestantes?: number;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  plan: {
    id: string;
    nombre: string;
    precio: number;
    duracionDias: number;
  };
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class MembresiaListResponseDto {
  membresias: MembresiaResponseDto[];
  total: number;
}

export class CambiarPlanResultDto {
  membresiaActualizada: MembresiaResponseDto;
  pagoGenerado?: any;
  diferenciaPrecio: number;
  mensajeDiferencia: string;
}