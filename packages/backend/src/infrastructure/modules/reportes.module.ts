import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ReportesController } from '@interface/controllers/reportes.controller';
import { GetIngresosDetalladosUseCase } from '@application/use-cases/reportes/get-ingresos-detallados.use-case';
import { GetProductosMasVendidosUseCase } from '@application/use-cases/reportes/get-productos-mas-vendidos.use-case';
import { GetIngresosDiariosUseCase } from '@application/use-cases/reportes/get-ingresos-diarios.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportesController],
  providers: [
    GetIngresosDetalladosUseCase,
    GetProductosMasVendidosUseCase,
    GetIngresosDiariosUseCase,
  ],
})
export class ReportesModule {}