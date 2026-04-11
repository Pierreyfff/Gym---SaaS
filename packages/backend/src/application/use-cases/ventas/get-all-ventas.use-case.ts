import { Injectable, Inject } from '@nestjs/common';
import { IVentaProductoRepository } from '@domain/repositories/venta-producto.repository.interface';
import { VentaProductoListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllVentasUseCase {
  constructor(
    @Inject('IVentaProductoRepository')
    private readonly ventaRepository: IVentaProductoRepository,
  ) {}

  async execute(gimnasioId: string): Promise<VentaProductoListResponseDto> {
    return this.ventaRepository.findAll(gimnasioId);
  }
}