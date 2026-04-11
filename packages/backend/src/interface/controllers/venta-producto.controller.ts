import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
} from '@gym-saas/shared';
import { CreateVentaUseCase } from '@application/use-cases/ventas/create-venta.use-case';
import { GetAllVentasUseCase } from '@application/use-cases/ventas/get-all-ventas.use-case';

@Controller('ventas-productos')
@Roles('admin', 'recepcionista', 'cliente')
export class VentaProductoController {
  constructor(
    private readonly createVentaUseCase:  CreateVentaUseCase,
    private readonly getAllVentasUseCase: GetAllVentasUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateVentaProductoDto,
    @Request() req: any,
  ): Promise<VentaProductoResponseDto[]> {
    return this. createVentaUseCase. execute(req.user.gimnasioId, req.user.id, createDto);
  }

  @Get()
  async findAll(@Request() req: any): Promise<VentaProductoListResponseDto> {
    return this.getAllVentasUseCase.execute(req.user.gimnasioId);
  }
}