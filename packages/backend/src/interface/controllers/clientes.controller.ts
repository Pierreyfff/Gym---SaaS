import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateClienteDto,
  UpdateClienteDto,
  ClienteResponseDto,
  ClienteListResponseDto,
} from '@gym-saas/shared';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateClienteUseCase } from '@application/use-cases/clientes/create-cliente.use-case';
import { GetAllClientesUseCase } from '@application/use-cases/clientes/get-all-clientes.use-case';
import { GetClienteByIdUseCase } from '@application/use-cases/clientes/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '@application/use-cases/clientes/update-cliente.use-case';
import { DeleteClienteUseCase } from '@application/use-cases/clientes/delete-cliente.use-case';
import { GetClientesDisponiblesMembresiaUseCase } from '@application/use-cases/clientes/get-clientes-disponibles-membresia.use-case';
import { GetClientePerfilCompletoUseCase } from '@application/use-cases/clientes/get-cliente-perfil-completo.use-case';

@Controller('clientes')
@Roles('admin', 'recepcionista', 'entrenador')
export class ClientesController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly getAllClientesUseCase: GetAllClientesUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly deleteClienteUseCase: DeleteClienteUseCase,
    private readonly getClientesDisponiblesMembresiaUseCase: GetClientesDisponiblesMembresiaUseCase,
    private readonly getClientePerfilCompletoUseCase: GetClientePerfilCompletoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClienteDto: CreateClienteDto,
    @Request() req: any,
  ): Promise<ClienteResponseDto> {
    return this.createClienteUseCase.execute(createClienteDto, req.user.gimnasioId);
  }

  @Get()
  async findAll(@Request() req: any): Promise<ClienteListResponseDto> {
    return this.getAllClientesUseCase.execute(req.user.gimnasioId);
  }

  @Get('disponibles-membresia')
  async getDisponiblesParaMembresia(@Request() req: any): Promise<ClienteListResponseDto> {
    return this.getClientesDisponiblesMembresiaUseCase.execute(req.user.gimnasioId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ClienteResponseDto> {
    return this.getClienteByIdUseCase.execute(id, req.user.gimnasioId);
  }

  @Get(':id/perfil-completo')
  async getPerfilCompleto(@Param('id') id: string, @Request() req: any) {
    return this.getClientePerfilCompletoUseCase.execute(id, req.user.gimnasioId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @Request() req: any,
  ): Promise<ClienteResponseDto> {
    return this.updateClienteUseCase.execute(id, updateClienteDto, req.user.gimnasioId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteClienteUseCase.execute(id, req.user.gimnasioId);
  }
}