import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateMembresiaDto,
  UpdateMembresiaDto,
  RenovarMembresiaDto,
  CambiarPlanMembresiaDto,
  MembresiaResponseDto,
  MembresiaListResponseDto,
  CambiarPlanResultDto,
} from '@gym-saas/shared';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateMembresiaUseCase } from '@application/use-cases/membresias/create-membresia.use-case';
import { GetAllMembresiasUseCase } from '@application/use-cases/membresias/get-all-membresias.use-case';
import { GetMembresiaByIdUseCase } from '@application/use-cases/membresias/get-membresia-by-id.use-case';
import { GetMembresiasByClienteUseCase } from '@application/use-cases/membresias/get-membresias-by-cliente.use-case';
import { UpdateMembresiaUseCase } from '@application/use-cases/membresias/update-membresia.use-case';
import { CancelarMembresiaUseCase } from '@application/use-cases/membresias/cancelar-membresia.use-case';
import { DeleteMembresiaUseCase } from '@application/use-cases/membresias/delete-membresia.use-case';
import { RenovarMembresiaUseCase } from '@application/use-cases/membresias/renovar-membresia.use-case';
import { CambiarPlanMembresiaUseCase } from '@application/use-cases/membresias/cambiar-plan-membresia.use-case';

@Controller('membresias')
@Roles('admin', 'recepcionista') // Solo admin y recepcionistas
export class MembresiasController {
  constructor(
    private readonly createMembresiaUseCase: CreateMembresiaUseCase,
    private readonly getAllMembresiasUseCase: GetAllMembresiasUseCase,
    private readonly getMembresiaByIdUseCase: GetMembresiaByIdUseCase,
    private readonly getMembresiasByClienteUseCase: GetMembresiasByClienteUseCase,
    private readonly updateMembresiaUseCase: UpdateMembresiaUseCase,
    private readonly cancelarMembresiaUseCase: CancelarMembresiaUseCase,
    private readonly deleteMembresiaUseCase: DeleteMembresiaUseCase,
    private readonly renovarMembresiaUseCase: RenovarMembresiaUseCase,
    private readonly cambiarPlanMembresiaUseCase: CambiarPlanMembresiaUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMembresiaDto: CreateMembresiaDto,
    @Request() req: any,
  ): Promise<MembresiaResponseDto> {
    return this.createMembresiaUseCase.execute(
      createMembresiaDto,
      req.user.gimnasioId,
    );
  }

  @Get()
  async findAll(@Request() req: any): Promise<MembresiaListResponseDto> {
    return this.getAllMembresiasUseCase.execute(req.user.gimnasioId);
  }

  @Get('cliente/:clienteId')
  async findByCliente(
    @Param('clienteId') clienteId: string,
  ): Promise<MembresiaListResponseDto> {
    return this.getMembresiasByClienteUseCase.execute(clienteId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<MembresiaResponseDto> {
    return this.getMembresiaByIdUseCase.execute(id, req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin') // Solo admin puede actualizar membresías
  async update(
    @Param('id') id: string,
    @Body() updateMembresiaDto: UpdateMembresiaDto,
    @Request() req: any,
  ): Promise<MembresiaResponseDto> {
    return this.updateMembresiaUseCase.execute(
      id,
      updateMembresiaDto,
      req.user.gimnasioId,
    );
  }

  @Patch(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<MembresiaResponseDto> {
    return this.cancelarMembresiaUseCase.execute(id, req.user.gimnasioId);
  }

  @Post('renovar')
  @HttpCode(HttpStatus.CREATED)
  async renovar(
    @Body() renovarMembresiaDto: RenovarMembresiaDto,
    @Request() req: any,
  ): Promise<MembresiaResponseDto> {
    return this.renovarMembresiaUseCase.execute(
      renovarMembresiaDto,
      req.user.gimnasioId,
    );
  }

  @Post(':id/cambiar-plan')
  @HttpCode(HttpStatus.OK)
  async cambiarPlan(
    @Param('id') id: string,
    @Body() cambiarPlanDto: CambiarPlanMembresiaDto,
    @Request() req: any,
  ): Promise<CambiarPlanResultDto> {
    return this.cambiarPlanMembresiaUseCase.execute(
      id,
      cambiarPlanDto,
      req.user.gimnasioId,
    );
  }

  @Delete(':id')
  @Roles('admin') // Solo admin puede eliminar membresías
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteMembresiaUseCase.execute(id, req.user.gimnasioId);
  }
}