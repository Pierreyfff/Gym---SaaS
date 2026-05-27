import { AxiosInstance } from 'axios';
import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
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
}