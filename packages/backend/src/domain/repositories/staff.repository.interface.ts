import { CreateStaffDto, UpdateStaffDto, StaffResponseDto } from '@gym-saas/shared';

export interface IStaffRepository {
  create(gimnasioId: string, dto: CreateStaffDto): Promise<StaffResponseDto>;
  findAll(gimnasioId: string): Promise<StaffResponseDto[]>;
  findById(id: string, gimnasioId: string): Promise<StaffResponseDto | null>;
  update(id: string, gimnasioId: string, dto: UpdateStaffDto): Promise<StaffResponseDto>;
  delete(id: string, gimnasioId: string): Promise<void>;
}