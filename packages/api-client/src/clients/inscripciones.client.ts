import { AxiosInstance } from 'axios';
import {
  CreateInscripcionDto,
  InscripcionResponseDto,
} from '@gym-saas/shared';

export class InscripcionesClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto:  CreateInscripcionDto): Promise<InscripcionResponseDto> {
    const response = await this.axios.post<InscripcionResponseDto>('/inscripciones', dto);
    return response.data;
  }
}