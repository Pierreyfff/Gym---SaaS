import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITestimonioRepository } from '@domain/repositories/testimonio.repository.interface';

@Injectable()
export class DeleteTestimonioUseCase {
  constructor(
    @Inject('ITestimonioRepository')
    private readonly testimonioRepository: ITestimonioRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    const existing = await this.testimonioRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Testimonio no encontrado');
    }

    await this.testimonioRepository.delete(id, gimnasioId);
  }
}