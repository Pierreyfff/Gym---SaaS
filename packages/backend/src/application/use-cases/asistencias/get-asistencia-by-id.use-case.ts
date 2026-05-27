import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IAsistenciaRepository,
  ASISTENCIA_REPOSITORY,
} from '@domain/repositories/asistencia.repository.interface';

@Injectable()
export class GetAsistenciaByIdUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly asistenciaRepository: IAsistenciaRepository,
  ) {}

  async execute(id: string, gimnasioId: string) {
    const asistencia = await this.asistenciaRepository.findById(id, gimnasioId);

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${id} no encontrada`);
    }

    return asistencia;
  }
}