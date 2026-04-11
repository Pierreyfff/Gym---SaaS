import { Injectable, Inject } from '@nestjs/common';
import { ICategoriaProductoRepository } from '@domain/repositories/categoria-producto.repository.interface';

@Injectable()
export class DeleteCategoriaUseCase {
  constructor(
    @Inject('ICategoriaProductoRepository')
    private readonly categoriaRepository: ICategoriaProductoRepository,
  ) {}

  async execute(id: string, gimnasioId:  string): Promise<void> {
    return this.categoriaRepository.delete(id, gimnasioId);
  }
}