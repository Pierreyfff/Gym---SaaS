import { Injectable, Inject } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import { ProductoListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllProductosUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ProductoListResponseDto> {
    return this.productoRepository.findAll(gimnasioId);
  }
}