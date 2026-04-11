import { Injectable, Inject } from '@nestjs/common';
import { ITestimonioRepository } from '@domain/repositories/testimonio.repository.interface';
import { CreateTestimonioDto, TestimonioResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateTestimonioUseCase {
  constructor(
    @Inject('ITestimonioRepository')
    private readonly testimonioRepository: ITestimonioRepository,
  ) {}

  async execute(gimnasioId: string, dto: CreateTestimonioDto): Promise<TestimonioResponseDto> {
    return this.testimonioRepository.create(gimnasioId, dto);
  }
}