import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';
import { ProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetProductoByIdUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<ProductoResponseDto> {
    const producto = await this.productoRepository.findById(id, gimnasioId);

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }
}