import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/guards/jwt-auth.guard';
import { CreateAsistenciaUseCase } from '@application/use-cases/asistencias/create-asistencia.use-case';
import { GetAsistenciasUseCase } from '@application/use-cases/asistencias/get-asistencias.use-case';
import { GetAsistenciaByIdUseCase } from '@application/use-cases/asistencias/get-asistencia-by-id.use-case';
import { DeleteAsistenciaUseCase } from '@application/use-cases/asistencias/delete-asistencia.use-case';
import { GetClientesElegiblesUseCase } from '@application/use-cases/asistencias/get-clientes-elegibles.use-case';
import {
  CreateAsistenciaDto,
  AsistenciaResponseDto,
  AsistenciaListResponseDto,
} from '@gym-saas/shared';

@Controller('asistencias')
@UseGuards(JwtAuthGuard)
export class AsistenciasController {
  constructor(
    private readonly createAsistenciaUseCase: CreateAsistenciaUseCase,
    private readonly getAsistenciasUseCase: GetAsistenciasUseCase,
    private readonly getAsistenciaByIdUseCase: GetAsistenciaByIdUseCase,
    private readonly deleteAsistenciaUseCase: DeleteAsistenciaUseCase,
    private readonly getClientesElegiblesUseCase: GetClientesElegiblesUseCase,
  ) {}

  @Post()
  async create(
    @Request() req,
    @Body() createAsistenciaDto: CreateAsistenciaDto,
  ): Promise<AsistenciaResponseDto> {
    const gimnasioId = req.user.gimnasioId;

    const result = await this.createAsistenciaUseCase.execute(
      gimnasioId,
      createAsistenciaDto,
    );

    return this.mapToResponseDto(result);
  }

  @Get()
  async findAll(@Request() req): Promise<AsistenciaListResponseDto> {
    const gimnasioId = req.user.gimnasioId;

    const asistencias = await this.getAsistenciasUseCase.execute(gimnasioId);

    return {
      asistencias: asistencias.map((a) => this.mapToResponseDto(a)),
      total: asistencias.length,
    };
  }

  @Get('clientes-elegibles')
  async getClientesElegibles(@Request() req) {
    const gimnasioId = req.user.gimnasioId;
    const clientesElegibles = await this.getClientesElegiblesUseCase.execute(gimnasioId);

    return {
      clientes: clientesElegibles.map((item) => ({
        id: item.cliente.id,
        nombre: item.cliente.nombre,
        apellido: item.cliente.apellido,
        email: item.cliente.email,
        plan: {
          id: item.plan.id,
          nombre: item.plan.nombre,
        },
      })),
      total: clientesElegibles.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AsistenciaResponseDto> {
    const result = await this.getAsistenciaByIdUseCase.execute(id);
    return this.mapToResponseDto(result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteAsistenciaUseCase.execute(id);
  }

  private mapToResponseDto(data: any): AsistenciaResponseDto {
    return {
      id: data.asistencia.id,
      gimnasioId: data.asistencia.gimnasioId,
      marcaTiempo: data.asistencia.marcaTiempo,
      cliente: {
        id: data.cliente.id,
        nombre: data.cliente.nombre,
        apellido: data.cliente.apellido,
        email: data.cliente.email,
      },
      fechaCreacion: data.asistencia.fechaCreacion,
    };
  }
}