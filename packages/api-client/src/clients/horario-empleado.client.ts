import { AxiosInstance } from 'axios';
import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
  HorarioEmpleadoResponseDto,
  HorarioEmpleadoListResponseDto,
} from '@gym-saas/shared';

export class HorarioEmpleadoClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateHorarioEmpleadoDto): Promise<HorarioEmpleadoResponseDto> {
    const response = await this.axios.post<HorarioEmpleadoResponseDto>('/horarios', dto);
    return response.data;
  }

  async findAll(usuarioId?: string): Promise<HorarioEmpleadoListResponseDto> {
    const params = usuarioId ? { usuarioId } : {};
    const response = await this.axios.get<HorarioEmpleadoListResponseDto>('/horarios', { params });
    return response.data;
  }

  async update(id: string, dto: UpdateHorarioEmpleadoDto): Promise<HorarioEmpleadoResponseDto> {
    const response = await this.axios.patch<HorarioEmpleadoResponseDto>(`/horarios/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/horarios/${id}`);
  }
}
