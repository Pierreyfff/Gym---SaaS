import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
  UpdateEstadoEnvioDto,
} from '@gym-saas/shared';
import { CreateVentaUseCase } from '@application/use-cases/ventas/create-venta.use-case';
import { GetAllVentasUseCase } from '@application/use-cases/ventas/get-all-ventas.use-case';
import { UpdateEstadoEnvioUseCase } from '@application/use-cases/ventas/update-estado-envio.use-case';

@Controller('ventas-productos')
@Roles('admin', 'recepcionista', 'cliente')
export class VentaProductoController {
  constructor(
    private readonly createVentaUseCase:  CreateVentaUseCase,
    private readonly getAllVentasUseCase: GetAllVentasUseCase,
    private readonly updateEstadoEnvioUseCase: UpdateEstadoEnvioUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateVentaProductoDto,
    @Request() req: any,
  ): Promise<VentaProductoResponseDto[]> {
    return this.createVentaUseCase.execute(req.user.gimnasioId, req.user.userId, createDto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('clienteId') clienteId?: string,
  ): Promise<VentaProductoListResponseDto> {
    const filterClienteId = req.user.rol === 'cliente' ? req.user.userId : clienteId;
    return this.getAllVentasUseCase.execute(req.user.gimnasioId, filterClienteId);
  }

  @Patch(':id/estado-envio')
  @Roles('admin', 'recepcionista')
  @HttpCode(HttpStatus.OK)
  async updateEstadoEnvio(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoEnvioDto,
    @Request() req: any,
  ): Promise<VentaProductoResponseDto> {
    return this.updateEstadoEnvioUseCase.execute(id, req.user.gimnasioId, dto);
  }
}