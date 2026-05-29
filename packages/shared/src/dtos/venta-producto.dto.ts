import { IsString, IsNumber, IsInt, IsOptional, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemVentaDto {
  @IsString()
  productoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateVentaProductoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  items: ItemVentaDto[];

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsString()
  metodoPago: string; // efectivo, tarjeta, transferencia

  @IsOptional()
  @IsString()
  nota?: string;

  // Campos de entrega
  @IsEnum(['retiro', 'domicilio'])
  tipoEntrega: 'retiro' | 'domicilio';

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsString()
  telefono: string;
}

export class VentaProductoResponseDto {
  id: string;
  gimnasioId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  metodoPago: string;
  nota?: string;
  tipoEntrega?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  telefono?: string;
  estadoEnvio?: string;
  fechaVenta: Date;
  producto: {
    id: string;
    nombre: string;
  };
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  fechaCreacion: Date;
}

export class VentaProductoListResponseDto {
  ventas: VentaProductoResponseDto[];
  total: number;
  totalIngresos: number;
}

export class UpdateEstadoEnvioDto {
  @IsEnum(['pendiente', 'preparando', 'enviado', 'entregado', 'cancelado'])
  estadoEnvio: 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
}