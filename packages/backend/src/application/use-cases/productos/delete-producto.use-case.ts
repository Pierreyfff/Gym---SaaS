import { Injectable, Inject } from '@nestjs/common';
import { IProductoRepository } from '@domain/repositories/producto.repository.interface';

@Injectable()
export class DeleteProductoUseCase {
  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    return this. productoRepository.delete(id, gimnasioId);
  }
}