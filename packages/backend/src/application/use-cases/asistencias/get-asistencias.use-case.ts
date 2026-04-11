import { Inject, Injectable } from '@nestjs/common';
import {
  IAsistenciaRepository,
  ASISTENCIA_REPOSITORY,
} from '@domain/repositories/asistencia.repository.interface';

@Injectable()
export class GetAsistenciasUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly asistenciaRepository: IAsistenciaRepository,
  ) {}

  async execute(gimnasioId: string) {
    return this.asistenciaRepository.findAllByGimnasio(gimnasioId);
  }
}