import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IImagenGaleriaRepository } from '@domain/repositories/imagen-galeria.repository.interface';

@Injectable()
export class DeleteImagenGaleriaUseCase {
  constructor(
    @Inject('IImagenGaleriaRepository')
    private readonly imagenRepository: IImagenGaleriaRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    const existing = await this.imagenRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Imagen no encontrada');
    }

    await this.imagenRepository.delete(id, gimnasioId);
  }
}