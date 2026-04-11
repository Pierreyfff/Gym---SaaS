import { AxiosInstance } from 'axios';
import {
  CreateAsistenciaDto,
  AsistenciaResponseDto,
  AsistenciaListResponseDto,
} from '@gym-saas/shared';

export class AsistenciasClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateAsistenciaDto): Promise<AsistenciaResponseDto> {
    const response = await this.axios.post<AsistenciaResponseDto>(
      '/asistencias',
      dto,
    );
    return response.data;
  }

  async findAll(
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<AsistenciaListResponseDto> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const response = await this.axios.get<AsistenciaListResponseDto>(
      '/asistencias',
      { params },
    );
    return response.data;
  }

  async findClientesElegibles(): Promise<any> {
    const response = await this.axios.get('/asistencias/clientes-elegibles');
    return response.data;
  }

  async findOne(id: string): Promise<AsistenciaResponseDto> {
    const response = await this.axios.get<AsistenciaResponseDto>(
      `/asistencias/${id}`,
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/asistencias/${id}`);
  }
}
