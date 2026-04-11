import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
} from '@gym-saas/shared';

export interface IVentaProductoRepository {
  create(gimnasioId: string, userId: string, dto: CreateVentaProductoDto): Promise<VentaProductoResponseDto[]>;
  findAll(gimnasioId: string): Promise<VentaProductoListResponseDto>;
  findById(id: string, gimnasioId: string): Promise<VentaProductoResponseDto | null>;
  findByDateRange(gimnasioId: string, fechaInicio: Date, fechaFin:  Date): Promise<VentaProductoListResponseDto>;
}