import { Injectable, Inject } from '@nestjs/common';
import { ITestimonioRepository } from '@domain/repositories/testimonio.repository.interface';
import { ListTestimoniosResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllTestimoniosUseCase {
  constructor(
    @Inject('ITestimonioRepository')
    private readonly testimonioRepository: ITestimonioRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ListTestimoniosResponseDto> {
    const testimonios = await this.testimonioRepository.findAll(gimnasioId);
    return {
      testimonios,
      total: testimonios.length,
    };
  }
}