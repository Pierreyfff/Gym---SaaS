import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { EstadisticasController } from '@interface/controllers/estadisticas.controller';
import { EstadisticasService } from '@application/services/estadisticas.service';

@Module({
  imports:  [DatabaseModule],
  controllers:  [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}