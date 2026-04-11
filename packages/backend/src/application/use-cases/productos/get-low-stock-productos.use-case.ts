import { Injectable, Inject } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import { ProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetLowStockProductosUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ProductoResponseDto[]> {
    return this.productoRepository.findLowStock(gimnasioId);
  }
}