import { AxiosInstance } from 'axios';
import {
  CreateClienteDto,
  UpdateClienteDto,
  ClienteResponseDto,
  ClienteListResponseDto,
} from '@gym-saas/shared';

export class ClientesClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    const response = await this.axios.post<ClienteResponseDto>('/clientes', dto);
    return response.data;
  }

  async findAll(): Promise<ClienteListResponseDto> {
    const response = await this.axios.get<ClienteListResponseDto>('/clientes');
    return response.data;
  }

  async findDisponiblesMembresia(): Promise<ClienteListResponseDto> {
    const response = await this.axios.get<ClienteListResponseDto>('/clientes/disponibles-membresia');
    return response.data;
  }

  async findOne(id: string): Promise<ClienteResponseDto> {
    const response = await this.axios.get<ClienteResponseDto>(`/clientes/${id}`);
    return response.data;
  }

  async getPerfilCompleto(id: string): Promise<any> {
    const response = await this.axios.get(`/clientes/${id}/perfil-completo`);
    return response.data;
  }

  async update(id: string, dto: UpdateClienteDto): Promise<ClienteResponseDto> {
    const response = await this.axios.put<ClienteResponseDto>(`/clientes/${id}`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/clientes/${id}`);
  }
}