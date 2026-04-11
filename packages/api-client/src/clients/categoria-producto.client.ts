import { AxiosInstance } from 'axios';
import {
  CreateCategoriaProductoDto,
  UpdateCategoriaProductoDto,
  CategoriaProductoResponseDto,
  CategoriaProductoListResponseDto,
} from '@gym-saas/shared';

export class CategoriaProductoClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateCategoriaProductoDto): Promise<CategoriaProductoResponseDto> {
    const response = await this.axios.post<CategoriaProductoResponseDto>('/categorias-productos', dto);
    return response.data;
  }

  async findAll(): Promise<CategoriaProductoListResponseDto> {
    const response = await this.axios.get<CategoriaProductoListResponseDto>('/categorias-productos');
    return response.data;
  }

  async update(id: string, dto: UpdateCategoriaProductoDto): Promise<CategoriaProductoResponseDto> {
    const response = await this.axios.put<CategoriaProductoResponseDto>(`/categorias-productos/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/categorias-productos/${id}`);
  }
}