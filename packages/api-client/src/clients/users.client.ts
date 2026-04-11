import { AxiosInstance } from 'axios';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  UserResponseDto,
  UserListResponseDto,
} from '@gym-saas/shared';

export class UsersClient {
  constructor(private readonly axios: AxiosInstance) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const response = await this.axios.post<UserResponseDto>('/users', dto);
    return response.data;
  }

  async findAll(): Promise<UserListResponseDto> {
    const response = await this.axios.get<UserListResponseDto>('/users');
    return response.data;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const response = await this.axios.get<UserResponseDto>(`/users/${id}`);
    return response.data;
  }

  async update(id: string, dto:  UpdateUserDto): Promise<UserResponseDto> {
    const response = await this.axios.put<UserResponseDto>(`/users/${id}`, dto);
    return response.data;
  }

  async changeStatus(id: string, dto: ChangeUserStatusDto): Promise<UserResponseDto> {
    const response = await this.axios.patch<UserResponseDto>(`/users/${id}/status`, dto);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/users/${id}`);
  }
}