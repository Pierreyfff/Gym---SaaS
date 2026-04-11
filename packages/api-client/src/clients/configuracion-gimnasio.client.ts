import { AxiosInstance } from 'axios';
import { UpdateConfiguracionGimnasioDto, ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

export class ConfiguracionGimnasioClient {
  constructor(private readonly axios: AxiosInstance) {}

  async getConfiguracion(): Promise<ConfiguracionGimnasioResponseDto> {
    const response = await this.axios. get<ConfiguracionGimnasioResponseDto>('/configuracion');
    return response.data;
  }

  async updateConfiguracion(dto: UpdateConfiguracionGimnasioDto): Promise<ConfiguracionGimnasioResponseDto> {
    const response = await this.axios. put<ConfiguracionGimnasioResponseDto>('/configuracion', dto);
    return response. data;
  }
}