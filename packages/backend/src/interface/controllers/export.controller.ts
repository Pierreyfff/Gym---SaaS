import { Controller, Get, Query, Request, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { ExportExcelService } from '@application/services/export-excel.service';
import { ExportPdfService } from '@application/services/export-pdf.service';

@Controller('export')
@Roles('admin', 'staff')
export class ExportController {
  constructor(
    private readonly exportExcelService: ExportExcelService,
    private readonly exportPdfService: ExportPdfService,
  ) {}

  @Get('clientes/excel')
  async exportarClientesExcel(@Request() req: any, @Res() res: Response) {
    try {
      const buffer = await this.exportExcelService.exportarClientes(req.user.gimnasioId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=clientes_${Date.now()}.xlsx`);
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error exportando clientes' });
    }
  }

  @Get('pagos/excel')
  async exportarPagosExcel(
    @Request() req: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Res() res?: Response,
  ) {
    try {
      const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
      const fin = fechaFin ? new Date(fechaFin) : undefined;

      const buffer = await this.exportExcelService.exportarPagos(req.user.gimnasioId, inicio, fin);

      res.setHeader('Content-Type', 'application/vnd. openxmlformats-officedocument.spreadsheetml. sheet');
      res.setHeader('Content-Disposition', `attachment; filename=pagos_${Date.now()}.xlsx`);
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error exportando pagos' });
    }
  }

  @Get('pagos/pdf')
  async exportarPagosPdf(
    @Request() req: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Res() res?: Response,
  ) {
    try {
      const inicio = fechaInicio ?  new Date(fechaInicio) : undefined;
      const fin = fechaFin ? new Date(fechaFin) : undefined;

      const buffer = await this. exportPdfService.exportarPagos(req.user.gimnasioId, inicio, fin);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pagos_${Date. now()}.pdf`);
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error exportando pagos' });
    }
  }

  @Get('asistencias/excel')
  async exportarAsistenciasExcel(
    @Request() req: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Res() res?: Response,
  ) {
    try {
      const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
      const fin = fechaFin ?  new Date(fechaFin) : undefined;

      const buffer = await this.exportExcelService. exportarAsistencias(req. user.gimnasioId, inicio, fin);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument. spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=asistencias_${Date.now()}.xlsx`);
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error exportando asistencias' });
    }
  }
}