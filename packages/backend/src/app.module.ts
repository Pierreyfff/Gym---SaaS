import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { validate } from '@infrastructure/config/env.validation';
import { AuthModule } from '@infrastructure/modules/auth.module';
import { UsersModule } from '@infrastructure/modules/users.module';
import { ClientesModule } from '@infrastructure/modules/clientes.module';
import { PlanesModule } from '@infrastructure/modules/planes.module';
import { MembresiasModule } from '@infrastructure/modules/membresias.module';
import { PagosModule } from '@infrastructure/modules/pagos.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { AsistenciasModule } from '@infrastructure/modules/asistencias.module';
import { InscripcionesModule } from '@infrastructure/modules/inscripciones.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MembresiasSchedulerService } from '@application/services/membresias-scheduler.service';
import { EstadisticasModule } from '@infrastructure/modules/estadisticas.module';
import { EmailModule } from '@infrastructure/modules/email.module';
import { AlertasMembresiasService } from '@application/services/alertas-membresias.service';
import { ConfiguracionGimnasioModule } from '@infrastructure/modules/configuracion-gimnasio.module';
import { ExportModule } from '@infrastructure/modules/export.module';
import { ProductosModule } from '@infrastructure/modules/productos.module';
import { ReportesModule } from '@infrastructure/modules/reportes.module';
import { StaffModule } from '@infrastructure/modules/staff.module';
import { TestimoniosModule } from '@infrastructure/modules/testimonios.module';
import { GaleriaModule } from '@infrastructure/modules/galeria.module';
import { PublicModule } from '@infrastructure/modules/public.module';
import { HorarioEmpleadoModule } from '@infrastructure/modules/horario-empleado.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    EmailModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ClientesModule,
    PlanesModule,
    MembresiasModule,
    PagosModule,
    AsistenciasModule,
    InscripcionesModule,
    EstadisticasModule,
    ReportesModule,
    ConfiguracionGimnasioModule,
    ExportModule,
    ProductosModule,
    StaffModule,
    TestimoniosModule,
    GaleriaModule,
    PublicModule,
    HorarioEmpleadoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    MembresiasSchedulerService,
    AlertasMembresiasService,
  ],
})
export class AppModule {}