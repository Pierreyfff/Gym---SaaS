import { Injectable, Inject } from '@nestjs/common';
import { IConfiguracionGimnasioRepository } from '@domain/repositories/configuracion-gimnasio.repository.interface';
import { ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetConfiguracionUseCase {
  constructor(
    @Inject('IConfiguracionGimnasioRepository')
    private readonly configuracionRepository: IConfiguracionGimnasioRepository,
  ) {}

  async execute(gimnasioId: string): Promise<ConfiguracionGimnasioResponseDto> {
    // Intentar obtener configuración existente
    let config = await this.configuracionRepository.findByGimnasioId(gimnasioId);

    // Si no existe, crear una por defecto
    if (!config) {
      config = await this.configuracionRepository.createOrUpdate(gimnasioId, {});
    }

    return config;
  }
}