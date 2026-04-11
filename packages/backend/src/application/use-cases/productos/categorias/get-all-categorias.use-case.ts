import { Injectable, Inject } from '@nestjs/common';
import { ICategoriaProductoRepository } from '@domain/repositories/categoria-producto.repository.interface';
import { CategoriaProductoListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllCategoriasUseCase {
  constructor(
    @Inject('ICategoriaProductoRepository')
    private readonly categoriaRepository: ICategoriaProductoRepository,
  ) {}

  async execute(gimnasioId: string): Promise<CategoriaProductoListResponseDto> {
    return this.categoriaRepository.findAll(gimnasioId);
  }
}