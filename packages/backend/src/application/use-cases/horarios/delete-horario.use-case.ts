import { Injectable, Inject } from '@nestjs/common';
import { IHorarioEmpleadoRepository } from '@domain/repositories/horario-empleado.repository.interface';

@Injectable()
export class DeleteHorarioUseCase {
  constructor(
    @Inject('IHorarioEmpleadoRepository')
    private readonly horarioRepository: IHorarioEmpleadoRepository,
  ) {}

  async execute(id: string, gimnasioId: string): Promise<void> {
    await this.horarioRepository.delete(id, gimnasioId);
  }
}
