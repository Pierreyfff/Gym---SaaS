import { AxiosInstance } from 'axios';
import {
  CreateTestimonioDto,
  UpdateTestimonioDto,
  TestimonioResponseDto,
  ListTestimoniosResponseDto,
} from '@gym-saas/shared';

export class TestimoniosClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateTestimonioDto): Promise<TestimonioResponseDto> {
    const response = await this.axios.post<TestimonioResponseDto>('/testimonios', dto);
    return response.data;
  }

  async findAll(): Promise<ListTestimoniosResponseDto> {
    const response = await this.axios.get<ListTestimoniosResponseDto>('/testimonios');
    return response.data;
  }

  async update(id: string, dto: UpdateTestimonioDto): Promise<TestimonioResponseDto> {
    const response = await this.axios.put<TestimonioResponseDto>(`/testimonios/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/testimonios/${id}`);
  }
}