import { AxiosInstance } from 'axios';
import {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  UserDto,
  ChangePasswordDto,
  RegisterClienteDto, // ← NUEVO
} from '@gym-saas/shared';

export class AuthClient {
  constructor(private readonly axios: AxiosInstance) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const response = await this.axios.post<LoginResponseDto>(
      '/auth/login',
      dto,
    );
    return response.data;
  }

    async register(dto: RegisterClienteDto): Promise<LoginResponseDto> {
    const response = await this.axios.post<LoginResponseDto>('/auth/register', dto);
    return response.data;
  }

  async refresh(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const response = await this.axios.post<RefreshTokenResponseDto>(
      '/auth/refresh',
      dto,
    );
    return response.data;
  }

  async getCurrentUser(): Promise<UserDto> {
    const response = await this.axios.get<UserDto>('/auth/me');
    return response.data;
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await this.axios.patch('/auth/change-password', dto);
  }
}
