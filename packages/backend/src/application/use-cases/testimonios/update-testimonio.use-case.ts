import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ITestimonioRepository } from '@domain/repositories/testimonio.repository.interface';
import { UpdateTestimonioDto, TestimonioResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateTestimonioUseCase {
  constructor(
    @Inject('ITestimonioRepository')
    private readonly testimonioRepository: ITestimonioRepository,
  ) {}

  async execute(id: string, gimnasioId: string, dto: UpdateTestimonioDto): Promise<TestimonioResponseDto> {
    const existing = await this.testimonioRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Testimonio no encontrado');
    }

    return this.testimonioRepository.update(id, gimnasioId, dto);
  }
}