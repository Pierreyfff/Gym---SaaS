import { AxiosInstance } from 'axios';
import {
  CreateProductoDto,
  UpdateProductoDto,
  ProductoResponseDto,
  ProductoListResponseDto,
} from '@gym-saas/shared';

export class ProductoClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateProductoDto): Promise<ProductoResponseDto> {
    const response = await this.axios.post<ProductoResponseDto>('/productos', dto);
    return response.data;
  }

  async findAll(): Promise<ProductoListResponseDto> {
    const response = await this.axios. get<ProductoListResponseDto>('/productos');
    return response. data;
  }

  async findById(id: string): Promise<ProductoResponseDto> {
    const response = await this.axios.get<ProductoResponseDto>(`/productos/${id}`);
    return response.data;
  }

  async findLowStock(): Promise<ProductoResponseDto[]> {
    const response = await this.axios.get<ProductoResponseDto[]>('/productos/low-stock');
    return response.data;
  }

  async update(id: string, dto: UpdateProductoDto): Promise<ProductoResponseDto> {
    const response = await this. axios.put<ProductoResponseDto>(`/productos/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/productos/${id}`);
  }
}