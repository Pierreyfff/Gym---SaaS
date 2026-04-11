import { Module } from '@nestjs/common';
import { AsistenciasController } from '@interface/controllers/asistencias.controller';
import { AsistenciaRepository } from '@infrastructure/repositories/asistencia.repository';
import { ASISTENCIA_REPOSITORY } from '@domain/repositories/asistencia.repository.interface';
import { CreateAsistenciaUseCase } from '@application/use-cases/asistencias/create-asistencia.use-case';
import { GetAsistenciasUseCase } from '@application/use-cases/asistencias/get-asistencias.use-case';
import { GetAsistenciaByIdUseCase } from '@application/use-cases/asistencias/get-asistencia-by-id.use-case';
import { DeleteAsistenciaUseCase } from '@application/use-cases/asistencias/delete-asistencia.use-case';
import { GetClientesElegiblesUseCase } from '@application/use-cases/asistencias/get-clientes-elegibles.use-case';
import { MembresiasModule } from './membresias.module';

@Module({
  imports: [MembresiasModule],
  controllers: [AsistenciasController],
  providers: [
    {
      provide: ASISTENCIA_REPOSITORY,
      useClass: AsistenciaRepository,
    },
    CreateAsistenciaUseCase,
    GetAsistenciasUseCase,
    GetAsistenciaByIdUseCase,
    DeleteAsistenciaUseCase,
    GetClientesElegiblesUseCase,
  ],
  exports: [ASISTENCIA_REPOSITORY],
})
export class AsistenciasModule {}