import { AxiosInstance } from 'axios';
import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
  UpdateEstadoEnvioDto,
} from '@gym-saas/shared';

export class VentaProductoClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateVentaProductoDto): Promise<VentaProductoResponseDto[]> {
    const response = await this.axios.post<VentaProductoResponseDto[]>('/ventas-productos', dto);
    return response.data;
  }

  async findAll(clienteId?: string): Promise<VentaProductoListResponseDto> {
    const params = clienteId ? { clienteId } : {};
    const response = await this.axios.get<VentaProductoListResponseDto>('/ventas-productos', { params });
    return response.data;
  }

  async updateEstadoEnvio(id: string, estadoEnvio: UpdateEstadoEnvioDto['estadoEnvio']): Promise<VentaProductoResponseDto> {
    const response = await this.axios.patch<VentaProductoResponseDto>(`/ventas-productos/${id}/estado-envio`, { estadoEnvio });
    return response.data;
  }
}