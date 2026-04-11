import { Injectable, Inject } from '@nestjs/common';
import { ICategoriaProductoRepository } from '@domain/repositories/categoria-producto.repository.interface';
import { CreateCategoriaProductoDto, CategoriaProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateCategoriaUseCase {
  constructor(
    @Inject('ICategoriaProductoRepository')
    private readonly categoriaRepository: ICategoriaProductoRepository,
  ) {}

  async execute(gimnasioId: string, dto: CreateCategoriaProductoDto): Promise<CategoriaProductoResponseDto> {
    return this.categoriaRepository.create(gimnasioId, dto);
  }
}