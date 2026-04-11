import { Injectable, Inject } from '@nestjs/common';
import { IStaffRepository } from '@domain/repositories/staff.repository.interface';
import { CreateStaffDto, StaffResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateStaffUseCase {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(gimnasioId: string, dto: CreateStaffDto): Promise<StaffResponseDto> {
    return this.staffRepository.create(gimnasioId, dto);
  }
}