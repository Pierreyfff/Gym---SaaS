import { Injectable, Inject } from '@nestjs/common';
import { ICategoriaProductoRepository } from '@domain/repositories/categoria-producto.repository.interface';
import { UpdateCategoriaProductoDto, CategoriaProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateCategoriaUseCase {
  constructor(
    @Inject('ICategoriaProductoRepository')
    private readonly categoriaRepository: ICategoriaProductoRepository,
  ) {}

  async execute(
    id: string,
    gimnasioId: string,
    dto: UpdateCategoriaProductoDto,
  ): Promise<CategoriaProductoResponseDto> {
    return this.categoriaRepository.update(id, gimnasioId, dto);
  }
}