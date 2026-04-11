import { Injectable, Inject } from '@nestjs/common';
import { IStaffRepository } from '@domain/repositories/staff.repository.interface';
import { StaffListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllStaffUseCase {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(gimnasioId: string): Promise<StaffListResponseDto> {
    const staff = await this.staffRepository.findAll(gimnasioId);
    return {
      staff,
      total: staff.length,
    };
  }
}