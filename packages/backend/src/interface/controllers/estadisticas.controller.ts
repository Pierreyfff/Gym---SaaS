import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { EstadisticasService } from '@application/services/estadisticas.service';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('generales')
  @Roles('admin', 'staff')
  async getEstadisticasGenerales(@Request() req: any) {
    return this.estadisticasService.getEstadisticasGenerales(req.user.gimnasioId);
  }

  @Get('ingresos-mensuales')
  @Roles('admin', 'staff')
  async getIngresosMensuales(@Request() req: any) {
    return this.estadisticasService.getIngresosMensuales(req.user.gimnasioId, 6);
  }

  @Get('planes-mas-vendidos')
  @Roles('admin', 'staff')
  async getPlanesMasVendidos(@Request() req: any) {
    return this.estadisticasService.getPlanesMasVendidos(req.user.gimnasioId, 5);
  }

  @Get('asistencias-por-mes')
  @Roles('admin', 'staff')
  async getAsistenciasPorMes(@Request() req: any) {
    return this.estadisticasService.getAsistenciasPorMes(req.user.gimnasioId, 6);
  }
}