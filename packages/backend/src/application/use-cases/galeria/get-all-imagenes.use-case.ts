import { Injectable, Inject } from '@nestjs/common';
import { IImagenGaleriaRepository } from '@domain/repositories/imagen-galeria.repository.interface';
import { ListImagenesGaleriaResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllImagenesGaleriaUseCase {
  constructor(
    @Inject('IImagenGaleriaRepository')
    private readonly imagenRepository: IImagenGaleriaRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ListImagenesGaleriaResponseDto> {
    const imagenes = await this.imagenRepository.findAll(gimnasioId);
    return {
      imagenes,
      total: imagenes.length,
    };
  }
}