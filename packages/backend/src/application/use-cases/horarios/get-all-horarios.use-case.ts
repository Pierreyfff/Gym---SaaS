import { Injectable, Inject } from '@nestjs/common';
import { IHorarioEmpleadoRepository } from '@domain/repositories/horario-empleado.repository.interface';
import { HorarioEmpleadoListResponseDto } from '@gym-saas/shared';

@Injectable()
export class GetAllHorariosUseCase {
  constructor(
    @Inject('IHorarioEmpleadoRepository')
    private readonly horarioRepository: IHorarioEmpleadoRepository,
  ) {}

  async execute(
    gimnasioId: string,
    usuarioId?: string,
  ): Promise<HorarioEmpleadoListResponseDto> {
    return this.horarioRepository.findAll(gimnasioId, usuarioId);
  }
}
