import { Injectable, Inject } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import { CreateProductoDto, ProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateProductoUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(gimnasioId: string, dto:  CreateProductoDto): Promise<ProductoResponseDto> {
    return this.productoRepository.create(gimnasioId, dto);
  }
}