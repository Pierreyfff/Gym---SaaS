import { AxiosInstance } from 'axios';
import {
  CreateMembresiaDto,
  UpdateMembresiaDto,
  MembresiaResponseDto,
  MembresiaListResponseDto,
  CambiarPlanMembresiaDto,
  CambiarPlanResultDto,
} from '@gym-saas/shared';

export class MembresiasClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateMembresiaDto): Promise<MembresiaResponseDto> {
    const response = await this.axios.post<MembresiaResponseDto>(
      '/membresias',
      dto,
    );
    return response.data;
  }

  async findAll(): Promise<MembresiaListResponseDto> {
    const response =
      await this.axios.get<MembresiaListResponseDto>('/membresias');
    return response.data;
  }

  async findByCliente(clienteId: string): Promise<MembresiaListResponseDto> {
    const response = await this.axios.get<MembresiaListResponseDto>(
      `/membresias/cliente/${clienteId}`,
    );
    return response.data;
  }

  async findOne(id: string): Promise<MembresiaResponseDto> {
    const response = await this.axios.get<MembresiaResponseDto>(
      `/membresias/${id}`,
    );
    return response.data;
  }

  async update(
    id: string,
    dto: UpdateMembresiaDto,
  ): Promise<MembresiaResponseDto> {
    const response = await this.axios.put<MembresiaResponseDto>(
      `/membresias/${id}`,
      dto,
    );
    return response.data;
  }

  async cancelar(id: string): Promise<MembresiaResponseDto> {
    const response = await this.axios.patch<MembresiaResponseDto>(
      `/membresias/${id}/cancelar`,
    );
    return response.data;
  }

  async renovar(dto: {
    membresiaId: string;
    planId: string;
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
    referenciaPago?: string;
    notasPago?: string;
  }): Promise<MembresiaResponseDto> {
    const response = await this.axios.post<MembresiaResponseDto>(
      '/membresias/renovar',
      dto,
    );
    return response.data;
  }

  async cambiarPlan(
    id: string,
    dto: CambiarPlanMembresiaDto,
  ): Promise<CambiarPlanResultDto> {
    const response = await this.axios.post<CambiarPlanResultDto>(
      `/membresias/${id}/cambiar-plan`,
      dto,
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/membresias/${id}`);
  }
}