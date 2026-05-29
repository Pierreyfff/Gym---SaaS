import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
  UpdateEstadoEnvioDto,
} from '@gym-saas/shared';

export interface IVentaProductoRepository {
  create(gimnasioId: string, userId: string, dto: CreateVentaProductoDto): Promise<VentaProductoResponseDto[]>;
  findAll(gimnasioId: string, clienteId?: string): Promise<VentaProductoListResponseDto>;
  findById(id: string, gimnasioId: string): Promise<VentaProductoResponseDto | null>;
  findByDateRange(gimnasioId: string, fechaInicio: Date, fechaFin:  Date): Promise<VentaProductoListResponseDto>;
  updateEstadoEnvio(id: string, gimnasioId: string, dto: UpdateEstadoEnvioDto): Promise<VentaProductoResponseDto>;
}