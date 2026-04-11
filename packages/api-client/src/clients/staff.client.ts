import { AxiosInstance } from 'axios';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffResponseDto,
  StaffListResponseDto,
} from '@gym-saas/shared';

export class StaffClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateStaffDto): Promise<StaffResponseDto> {
    const response = await this.axios.post<StaffResponseDto>('/staff', dto);
    return response.data;
  }

  async findAll(): Promise<StaffListResponseDto> {
    const response = await this.axios.get<StaffListResponseDto>('/staff');
    return response.data;
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffResponseDto> {
    const response = await this.axios.put<StaffResponseDto>(`/staff/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/staff/${id}`);
  }
}