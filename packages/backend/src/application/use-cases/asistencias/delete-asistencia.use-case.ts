import { Inject, Injectable } from '@nestjs/common';
import {
  IAsistenciaRepository,
  ASISTENCIA_REPOSITORY,
} from '@domain/repositories/asistencia.repository.interface';

@Injectable()
export class DeleteAsistenciaUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly asistenciaRepository: IAsistenciaRepository,
  ) {}

  async execute(id: string, gimnasioId: string) {
    await this.asistenciaRepository.delete(id, gimnasioId);
  }
}