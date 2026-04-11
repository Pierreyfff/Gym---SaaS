import { Module } from '@nestjs/common';
import { PagosController } from '@interface/controllers/pagos.controller';
import { PagoRepository } from '@infrastructure/repositories/pago.repository';
import { MembresiaRepository } from '@infrastructure/repositories/membresia.repository';
import { PAGO_REPOSITORY } from '@domain/repositories/pago.repository.interface';
import { CreatePagoUseCase } from '@application/use-cases/pagos/create-pago.use-case';
import { GetPagosUseCase } from '@application/use-cases/pagos/get-pagos.use-case';
import { GetPagoByIdUseCase } from '@application/use-cases/pagos/get-pago-by-id.use-case';
import { UpdatePagoUseCase } from '@application/use-cases/pagos/update-pago.use-case';
import { ReembolsarPagoUseCase } from '@application/use-cases/pagos/reembolsar-pago.use-case';
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PagosController],
  providers: [
    {
      provide: PAGO_REPOSITORY,
      useClass: PagoRepository,
    },
    {
      provide: 'IMembresiaRepository',
      useClass: MembresiaRepository,
    },
    CreatePagoUseCase,
    GetPagosUseCase,
    GetPagoByIdUseCase,
    UpdatePagoUseCase,
    ReembolsarPagoUseCase,
  ],
  exports: [PAGO_REPOSITORY],
})
export class PagosModule {}