import { Injectable, Inject } from '@nestjs/common';
import { IImagenGaleriaRepository } from '@domain/repositories/imagen-galeria.repository.interface';
import { CreateImagenGaleriaDto, ImagenGaleriaResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateImagenGaleriaUseCase {
  constructor(
    @Inject('IImagenGaleriaRepository')
    private readonly imagenRepository: IImagenGaleriaRepository,
  ) {}

  async execute(gimnasioId: string, dto: CreateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    return this.imagenRepository.create(gimnasioId, dto);
  }
}