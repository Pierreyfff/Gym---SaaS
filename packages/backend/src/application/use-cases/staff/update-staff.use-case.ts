import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStaffRepository } from '@domain/repositories/staff.repository.interface';
import { UpdateStaffDto, StaffResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateStaffUseCase {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(id: string, gimnasioId: string, dto: UpdateStaffDto): Promise<StaffResponseDto> {
    const existing = await this.staffRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    return this.staffRepository.update(id, gimnasioId, dto);
  }
}