import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  IAsistenciaRepository,
  ASISTENCIA_REPOSITORY,
} from '@domain/repositories/asistencia.repository.interface';
import { CreateAsistenciaDto } from '@gym-saas/shared';

@Injectable()
export class CreateAsistenciaUseCase {
  constructor(
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly asistenciaRepository: IAsistenciaRepository,
  ) {}

  async execute(gimnasioId: string, dto: CreateAsistenciaDto) {
    // Validar si ya existe check-in hoy
    const existingCheckIn = await this.asistenciaRepository.findTodayByCliente(
      gimnasioId,
      dto.clienteId,
    );

    if (existingCheckIn) {
      const hora = existingCheckIn.asistencia.marcaTiempo.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      throw new ConflictException(
        `${existingCheckIn.cliente.nombre} ${existingCheckIn.cliente.apellido} ya registró entrada hoy a las ${hora}`,
      );
    }

    return this.asistenciaRepository.create({
      gimnasioId,
      clienteId: dto.clienteId,
      marcaTiempo: dto.marcaTiempo ?  new Date(dto.marcaTiempo) : undefined,
    });
  }
}