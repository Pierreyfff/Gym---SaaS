import { AxiosInstance } from 'axios';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto,
  PlanListResponseDto,
} from '@gym-saas/shared';

export class PlanesClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreatePlanDto): Promise<PlanResponseDto> {
    const response = await this.axios.post<PlanResponseDto>('/planes', dto);
    return response.data;
  }

  async findAll(): Promise<PlanListResponseDto> {
    const response = await this.axios.get<PlanListResponseDto>('/planes');
    return response.data;
  }

  async findOne(id: string): Promise<PlanResponseDto> {
    const response = await this.axios.get<PlanResponseDto>(`/planes/${id}`);
    return response.data;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanResponseDto> {
    const response = await this.axios.put<PlanResponseDto>(`/planes/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/planes/${id}`);
  }
}