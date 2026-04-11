import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ConfiguracionGimnasioController } from '@interface/controllers/configuracion-gimnasio.controller';
import { GetConfiguracionUseCase } from '@application/use-cases/configuracion/get-configuracion.use-case';
import { UpdateConfiguracionUseCase } from '@application/use-cases/configuracion/update-configuracion.use-case';
import { ConfiguracionGimnasioRepository } from '@infrastructure/repositories/configuracion-gimnasio.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ConfiguracionGimnasioController],
  providers: [
    GetConfiguracionUseCase,
    UpdateConfiguracionUseCase,
    {
      provide: 'IConfiguracionGimnasioRepository',
      useClass: ConfiguracionGimnasioRepository,
    },
  ],
  exports: ['IConfiguracionGimnasioRepository'],
})
export class ConfiguracionGimnasioModule {}