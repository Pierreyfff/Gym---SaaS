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

  async findAll(): Promise<VentaProductoListResponseDto> {
    const response = await this. axios.get<VentaProductoListResponseDto>('/ventas-productos');
    return response. data;
  }
}