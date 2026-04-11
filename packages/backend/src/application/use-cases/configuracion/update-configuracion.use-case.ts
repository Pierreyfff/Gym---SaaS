import { Injectable, Inject } from '@nestjs/common';
import { IConfiguracionGimnasioRepository } from '@domain/repositories/configuracion-gimnasio.repository.interface';
import { UpdateConfiguracionGimnasioDto, ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateConfiguracionUseCase {
  constructor(
    @Inject('IConfiguracionGimnasioRepository')
    private readonly configuracionRepository: IConfiguracionGimnasioRepository,
  ) {}

  async execute(
    gimnasioId: string,
    dto: UpdateConfiguracionGimnasioDto,
  ): Promise<ConfiguracionGimnasioResponseDto> {
    return this.configuracionRepository.createOrUpdate(gimnasioId, dto);
  }
}