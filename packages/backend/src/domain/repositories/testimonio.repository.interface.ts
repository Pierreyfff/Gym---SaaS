import { CreateTestimonioDto, UpdateTestimonioDto, TestimonioResponseDto } from '@gym-saas/shared';

export interface ITestimonioRepository {
  create(gimnasioId: string, dto: CreateTestimonioDto): Promise<TestimonioResponseDto>;
  findAll(gimnasioId: string): Promise<TestimonioResponseDto[]>;
  findById(id: string, gimnasioId: string): Promise<TestimonioResponseDto | null>;
  update(id: string, gimnasioId: string, dto: UpdateTestimonioDto): Promise<TestimonioResponseDto>;
  delete(id: string, gimnasioId: string): Promise<void>;
}