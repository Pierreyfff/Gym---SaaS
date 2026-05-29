import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IHorarioEmpleadoRepository } from '@domain/repositories/horario-empleado.repository.interface';
import { CreateHorarioEmpleadoDto, HorarioEmpleadoResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateHorarioUseCase {
  constructor(
    @Inject('IHorarioEmpleadoRepository')
    private readonly horarioRepository: IHorarioEmpleadoRepository,
  ) {}

  async execute(
    gimnasioId: string,
    dto: CreateHorarioEmpleadoDto,
  ): Promise<HorarioEmpleadoResponseDto> {
    const existente = await this.horarioRepository.findByUsuarioAndDia(
      gimnasioId,
      dto.usuarioId,
      dto.diaSemana,
    );

    if (existente) {
      throw new ConflictException(
        'El empleado ya tiene un horario asignado para este día',
      );
    }

    return this.horarioRepository.create(gimnasioId, dto);
  }
}
