import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStaffRepository } from '@domain/repositories/staff.repository.interface';

@Injectable()
export class DeleteStaffUseCase {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    const existing = await this.staffRepository.findById(id, gimnasioId);
    if (!existing) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    await this.staffRepository.delete(id, gimnasioId);
  }
}