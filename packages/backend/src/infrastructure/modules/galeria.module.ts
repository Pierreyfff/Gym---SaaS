import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ImagenGaleriaRepository } from '@infrastructure/repositories/imagen-galeria.repository';
import { CreateImagenGaleriaUseCase } from '@application/use-cases/galeria/create-imagen.use-case';
import { GetAllImagenesGaleriaUseCase } from '@application/use-cases/galeria/get-all-imagenes.use-case';
import { UpdateImagenGaleriaUseCase } from '@application/use-cases/galeria/update-imagen.use-case';
import { DeleteImagenGaleriaUseCase } from '@application/use-cases/galeria/delete-imagen.use-case';
import { GaleriaController } from '@interface/controllers/galeria.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [GaleriaController],
  providers: [
    {
      provide: 'IImagenGaleriaRepository',
      useClass: ImagenGaleriaRepository,
    },
    CreateImagenGaleriaUseCase,
    GetAllImagenesGaleriaUseCase,
    UpdateImagenGaleriaUseCase,
    DeleteImagenGaleriaUseCase,
  ],
  exports: ['IImagenGaleriaRepository'],
})
export class GaleriaModule {}