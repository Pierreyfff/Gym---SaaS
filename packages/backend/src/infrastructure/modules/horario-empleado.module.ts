import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { HorarioEmpleadoController } from '@interface/controllers/horario-empleado.controller';
import { CreateHorarioUseCase } from '@application/use-cases/horarios/create-horario.use-case';
import { GetAllHorariosUseCase } from '@application/use-cases/horarios/get-all-horarios.use-case';
import { UpdateHorarioUseCase } from '@application/use-cases/horarios/update-horario.use-case';
import { DeleteHorarioUseCase } from '@application/use-cases/horarios/delete-horario.use-case';
import { HorarioEmpleadoRepository } from '@infrastructure/repositories/horario-empleado.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [HorarioEmpleadoController],
  providers: [
    {
      provide: 'IHorarioEmpleadoRepository',
      useClass: HorarioEmpleadoRepository,
    },
    CreateHorarioUseCase,
    GetAllHorariosUseCase,
    UpdateHorarioUseCase,
    DeleteHorarioUseCase,
  ],
  exports: [],
})
export class HorarioEmpleadoModule {}
