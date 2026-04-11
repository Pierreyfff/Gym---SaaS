import {
  CreateProductoDto,
  UpdateProductoDto,
  ProductoResponseDto,
  ProductoListResponseDto,
} from '@gym-saas/shared';

export interface IProductoRepository {
  create(gimnasioId: string, dto: CreateProductoDto): Promise<ProductoResponseDto>;
  findAll(gimnasioId: string): Promise<ProductoListResponseDto>;
  findById(id: string, gimnasioId: string): Promise<ProductoResponseDto | null>;
  update(id: string, gimnasioId: string, dto: UpdateProductoDto): Promise<ProductoResponseDto>;
  delete(id: string, gimnasioId:  string): Promise<void>;
  updateStock(id: string, cantidad: number): Promise<void>;
  findLowStock(gimnasioId: string): Promise<ProductoResponseDto[]>;
}