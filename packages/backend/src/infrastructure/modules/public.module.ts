import { Module } from '@nestjs/common';
import { PublicController } from '@interface/controllers/public.controller';
import { ConfiguracionGimnasioModule } from './configuracion-gimnasio.module';
import { StaffModule } from './staff.module';
import { TestimoniosModule } from './testimonios.module';
import { GaleriaModule } from './galeria.module';
import { PlanesModule } from './planes.module';
import { ProductosModule } from './productos.module';
import { GetConfiguracionUseCase } from '@application/use-cases/configuracion/get-configuracion.use-case';
import { GetAllStaffUseCase } from '@application/use-cases/staff/get-all-staff.use-case';
import { GetAllTestimoniosUseCase } from '@application/use-cases/testimonios/get-all-testimonios.use-case';
import { GetAllImagenesGaleriaUseCase } from '@application/use-cases/galeria/get-all-imagenes.use-case';
import { GetAllPlanesUseCase } from '@application/use-cases/planes/get-all-planes.use-case';
import { GetAllProductosUseCase } from '@application/use-cases/productos/get-all-productos.use-case';

@Module({
  imports: [
    ConfiguracionGimnasioModule,
    StaffModule,
    TestimoniosModule,
    GaleriaModule,
    PlanesModule,
    ProductosModule,
  ],
  controllers: [PublicController],
  providers: [
    GetConfiguracionUseCase,
    GetAllStaffUseCase,
    GetAllTestimoniosUseCase,
    GetAllImagenesGaleriaUseCase,
    GetAllPlanesUseCase,
    GetAllProductosUseCase,
  ],
})
export class PublicModule {}