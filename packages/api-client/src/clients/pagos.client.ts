import { AxiosInstance } from 'axios';
import {
  CreatePagoDto,
  UpdatePagoDto,
  ReembolsarPagoDto,
  PagoResponseDto,
  PagoListResponseDto,
} from '@gym-saas/shared';

export class PagosClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreatePagoDto): Promise<PagoResponseDto> {
    const response = await this.axios.post<PagoResponseDto>('/pagos', dto);
    return response.data;
  }

  async findAll(): Promise<PagoListResponseDto> {
    const response = await this.axios.get<PagoListResponseDto>('/pagos');
    return response.data;
  }

  async findOne(id: string): Promise<PagoResponseDto> {
    const response = await this.axios.get<PagoResponseDto>(`/pagos/${id}`);
    return response.data;
  }

  async update(id: string, dto: UpdatePagoDto): Promise<PagoResponseDto> {
    const response = await this.axios.put<PagoResponseDto>(`/pagos/${id}`, dto);
    return response.data;
  }

  async reembolsar(id: string, dto: ReembolsarPagoDto): Promise<PagoResponseDto> {
    const response = await this.axios.patch<PagoResponseDto>(`/pagos/${id}/reembolsar`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/pagos/${id}`);
  }
}