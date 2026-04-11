import {
  CreateCategoriaProductoDto,
  UpdateCategoriaProductoDto,
  CategoriaProductoResponseDto,
  CategoriaProductoListResponseDto,
} from '@gym-saas/shared';

export interface ICategoriaProductoRepository {
  create(gimnasioId: string, dto: CreateCategoriaProductoDto): Promise<CategoriaProductoResponseDto>;
  findAll(gimnasioId: string): Promise<CategoriaProductoListResponseDto>;
  findById(id: string, gimnasioId: string): Promise<CategoriaProductoResponseDto | null>;
  update(id:  string, gimnasioId: string, dto: UpdateCategoriaProductoDto): Promise<CategoriaProductoResponseDto>;
  delete(id: string, gimnasioId: string): Promise<void>;
}