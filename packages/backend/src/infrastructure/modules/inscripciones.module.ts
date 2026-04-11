import { Module } from '@nestjs/common';
import { InscripcionesController } from '@interface/controllers/inscripciones.controller';
import { CreateInscripcionUseCase } from '@application/use-cases/inscripciones/create-inscripcion.use-case';
import { MembresiaRepository } from '@infrastructure/repositories/membresia.repository';
import { ClienteRepository } from '@infrastructure/repositories/cliente.repository';
import { PlanRepository } from '@infrastructure/repositories/plan.repository';
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InscripcionesController],
  providers:  [
    CreateInscripcionUseCase,
    {
      provide: 'IMembresiaRepository',
      useClass: MembresiaRepository,
    },
    {
      provide: 'IClienteRepository',
      useClass: ClienteRepository,
    },
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
  ],
})
export class InscripcionesModule {}