import { AxiosInstance } from 'axios';
import {
  CreateImagenGaleriaDto,
  UpdateImagenGaleriaDto,
  ImagenGaleriaResponseDto,
  ListImagenesGaleriaResponseDto,
} from '@gym-saas/shared';

export class GaleriaClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    const response = await this.axios.post<ImagenGaleriaResponseDto>('/galeria', dto);
    return response.data;
  }

  async findAll(): Promise<ListImagenesGaleriaResponseDto> {
    const response = await this.axios.get<ListImagenesGaleriaResponseDto>('/galeria');
    return response.data;
  }

  async update(id: string, dto: UpdateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto> {
    const response = await this.axios.put<ImagenGaleriaResponseDto>(`/galeria/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/galeria/${id}`);
  }
}