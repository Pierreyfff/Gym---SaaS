import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { GetIngresosDetalladosUseCase } from '@application/use-cases/reportes/get-ingresos-detallados.use-case';
import { GetProductosMasVendidosUseCase } from '@application/use-cases/reportes/get-productos-mas-vendidos.use-case';
import { GetIngresosDiariosUseCase } from '@application/use-cases/reportes/get-ingresos-diarios.use-case';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'staff')
export class ReportesController {
  constructor(
    private readonly getIngresosDetalladosUseCase: GetIngresosDetalladosUseCase,
    private readonly getProductosMasVendidosUseCase: GetProductosMasVendidosUseCase,
    private readonly getIngresosDiariosUseCase: GetIngresosDiariosUseCase,
  ) {}

  @Get('ingresos-detallados')
  async getIngresosDetallados(
    @Request() req: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('tipo') tipo?: 'membresia' | 'producto' | 'todos',
    @Query('metodoPago') metodoPago?: string,
  ) {
    const filtros = {
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      tipo,
      metodoPago,
    };

    return this.getIngresosDetalladosUseCase.execute(
      req.user.gimnasioId,
      filtros,
    );
  }

  @Get('productos-mas-vendidos')
  async getProductosMasVendidos(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.getProductosMasVendidosUseCase.execute(
      req.user.gimnasioId,
      limit ? parseInt(limit) : 10,
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }

  @Get('ingresos-diarios')
  async getIngresosDiarios(
    @Request() req: any,
    @Query('dias') dias?: string,
  ) {
    return this.getIngresosDiariosUseCase.execute(
      req.user.gimnasioId,
      dias ? parseInt(dias) : 30,
    );
  }
}