import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IImagenGaleriaRepository } from '@domain/repositories/imagen-galeria.repository.interface';
import { UpdateImagenGaleriaDto, ImagenGaleriaResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateImagenGaleriaUseCase {
  constructor(
    @Inject('IImagenGaleriaRepository')
    private readonly imagenRepository: IImagenGaleriaRepository,
  ) {}

  async execute(id: string, gimnasioId: string, dto: UpdateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    const existing = await this.imagenRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return this.imagenRepository.update(id, gimnasioId, dto);
  }
}