import { UpdateConfiguracionGimnasioDto, ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

export interface IConfiguracionGimnasioRepository {
  findByGimnasioId(gimnasioId: string): Promise<ConfiguracionGimnasioResponseDto | null>;
  createOrUpdate(gimnasioId: string, data: UpdateConfiguracionGimnasioDto): Promise<ConfiguracionGimnasioResponseDto>;
}