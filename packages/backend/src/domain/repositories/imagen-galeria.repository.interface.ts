import { CreateImagenGaleriaDto, UpdateImagenGaleriaDto, ImagenGaleriaResponseDto } from '@gym-saas/shared';

export interface IImagenGaleriaRepository {
  create(gimnasioId: string, dto: CreateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto>;
  findAll(gimnasioId: string): Promise<ImagenGaleriaResponseDto[]>;
  findById(id: string, gimnasioId: string): Promise<ImagenGaleriaResponseDto | null>;
  update(id: string, gimnasioId: string, dto: UpdateImagenGaleriaDto): Promise<ImagenGaleriaResponseDto>;
  delete(id: string, gimnasioId: string): Promise<void>;
}