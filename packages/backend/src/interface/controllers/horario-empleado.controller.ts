import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@infrastructure/guards/roles.guard';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateHorarioUseCase } from '@application/use-cases/horarios/create-horario.use-case';
import { GetAllHorariosUseCase } from '@application/use-cases/horarios/get-all-horarios.use-case';
import { UpdateHorarioUseCase } from '@application/use-cases/horarios/update-horario.use-case';
import { DeleteHorarioUseCase } from '@application/use-cases/horarios/delete-horario.use-case';
import {
  CreateHorarioEmpleadoDto,
  UpdateHorarioEmpleadoDto,
} from '@gym-saas/shared';
import { Request } from 'express';

@Controller('horarios')
@UseGuards(AuthGuard, RolesGuard)
export class HorarioEmpleadoController {
  constructor(
    private readonly createHorarioUseCase: CreateHorarioUseCase,
    private readonly getAllHorariosUseCase: GetAllHorariosUseCase,
    private readonly updateHorarioUseCase: UpdateHorarioUseCase,
    private readonly deleteHorarioUseCase: DeleteHorarioUseCase,
  ) {}

  @Post()
  @Roles('admin', 'recepcionista')
  async create(
    @Body() dto: CreateHorarioEmpleadoDto,
    @Req() req: Request,
  ) {
    return this.createHorarioUseCase.execute((req as any).user.gimnasioId, dto);
  }

  @Get()
  @Roles('admin', 'recepcionista', 'entrenador')
  async findAll(
    @Query('usuarioId') usuarioId: string | undefined,
    @Req() req: Request,
  ) {
    return this.getAllHorariosUseCase.execute((req as any).user.gimnasioId, usuarioId);
  }

  @Patch(':id')
  @Roles('admin', 'recepcionista')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHorarioEmpleadoDto,
    @Req() req: Request,
  ) {
    return this.updateHorarioUseCase.execute(id, (req as any).user.gimnasioId, dto);
  }

  @Delete(':id')
  @Roles('admin', 'recepcionista')
  async delete(@Param('id') id: string, @Req() req: Request) {
    await this.deleteHorarioUseCase.execute(id, (req as any).user.gimnasioId);
    return { message: 'Horario eliminado correctamente' };
  }
}
