import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreatePagoUseCase } from '@application/use-cases/pagos/create-pago.use-case';
import { GetPagosUseCase } from '@application/use-cases/pagos/get-pagos.use-case';
import { GetPagoByIdUseCase } from '@application/use-cases/pagos/get-pago-by-id.use-case';
import { UpdatePagoUseCase } from '@application/use-cases/pagos/update-pago.use-case';
import { ReembolsarPagoUseCase } from '@application/use-cases/pagos/reembolsar-pago.use-case';
import {
  CreatePagoDto,
  UpdatePagoDto,
  ReembolsarPagoDto,
  PagoResponseDto,
  PagoListResponseDto,
} from '@gym-saas/shared';

@Controller('pagos')
@UseGuards(JwtAuthGuard)
@Roles('admin', 'recepcionista')
export class PagosController {
  constructor(
    private readonly createPagoUseCase: CreatePagoUseCase,
    private readonly getPagosUseCase: GetPagosUseCase,
    private readonly getPagoByIdUseCase: GetPagoByIdUseCase,
    private readonly updatePagoUseCase:  UpdatePagoUseCase,
    private readonly reembolsarPagoUseCase:  ReembolsarPagoUseCase,
  ) {}

  @Post()
  async create(
    @Request() req,
    @Body() createPagoDto: CreatePagoDto,
  ): Promise<PagoResponseDto> {
    const gimnasioId = req.user. gimnasioId;
    const userId = req.user.userId;

    const result = await this.createPagoUseCase.execute(
      gimnasioId,
      userId,
      createPagoDto,
    );

    return this.mapToResponseDto(result);
  }

  @Get()
  async findAll(@Request() req): Promise<PagoListResponseDto> {
    const gimnasioId = req. user.gimnasioId;

    const pagos = await this. getPagosUseCase.execute(gimnasioId);

    return {
      pagos:  pagos.map((p) => this.mapToResponseDto(p)),
      total: pagos.length,
      totalIngresos: pagos
        .filter((p) => p.pago.estado === 'completado')
        .reduce((sum, p) => sum + Number(p.pago.monto), 0),
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<PagoResponseDto> {
    const result = await this.getPagoByIdUseCase.execute(id, req.user.gimnasioId);
    return this.mapToResponseDto(result);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePagoDto: UpdatePagoDto,
    @Request() req,
  ): Promise<PagoResponseDto> {
    const result = await this.updatePagoUseCase.execute(id, updatePagoDto, req.user.gimnasioId);
    return this.mapToResponseDto(result);
  }

  @Patch(':id/reembolsar')
  @Roles('admin')
  async reembolsar(
    @Param('id') id: string,
    @Body() reembolsarDto: ReembolsarPagoDto,
    @Request() req,
  ): Promise<PagoResponseDto> {
    const gimnasioId = req.user. gimnasioId;
    const result = await this.reembolsarPagoUseCase. execute(id, gimnasioId, reembolsarDto);
    return this.mapToResponseDto(result);
  }

  private mapToResponseDto(data: any): PagoResponseDto {
    return {
      id: data.pago.id,
      gimnasioId: data.pago. gimnasioId,
      tipo: data.pago.tipo,
      monto: Number(data.pago.monto),
      metodoPago: data.pago.metodoPago,
      estado: data.pago.estado,
      referencia: data.pago.referencia,
      notas: data.pago.notas,
      motivoReembolso: data.pago.motivoReembolso,
      fechaReembolso: data.pago.fechaReembolso,
      membresia: {
        id:  data.membresia.id,
        fechaInicio: data.membresia.fechaInicio,
        fechaFin: data.membresia.fechaFin,
        cliente: {
          id: data. membresia.cliente.id,
          nombre: data.membresia.cliente.nombre,
          apellido: data.membresia.cliente.apellido,
          email: data.membresia. cliente.email,
        },
        plan: {
          id:  data.membresia.plan. id,
          nombre: data. membresia.plan.nombre,
          precio: Number(data. membresia.plan.precio),
        },
      },
      fechaCreacion: data.pago.fechaCreacion,
      fechaActualizacion: data.pago.fechaCreacion,
    };
  }
}