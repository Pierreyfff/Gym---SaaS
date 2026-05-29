import { Injectable, Inject } from '@nestjs/common';
import { IHorarioEmpleadoRepository } from '@domain/repositories/horario-empleado.repository.interface';
import { UpdateHorarioEmpleadoDto, HorarioEmpleadoResponseDto } from '@gym-saas/shared';

@Injectable()
export class UpdateHorarioUseCase {
  constructor(
    @Inject('IHorarioEmpleadoRepository')
    private readonly horarioRepository: IHorarioEmpleadoRepository,
  ) {}

  async execute(
    id: string,
    gimnasioId: string,
    dto: UpdateHorarioEmpleadoDto,
  ): Promise<HorarioEmpleadoResponseDto> {
    return this.horarioRepository.update(id, gimnasioId, dto);
  }
}
