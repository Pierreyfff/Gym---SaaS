import { Injectable, Inject } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import { UpdateProductoDto, ProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateProductoUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(id: string, gimnasioId:  string, dto: UpdateProductoDto): Promise<ProductoResponseDto> {
    return this.productoRepository.update(id, gimnasioId, dto);
  }
}