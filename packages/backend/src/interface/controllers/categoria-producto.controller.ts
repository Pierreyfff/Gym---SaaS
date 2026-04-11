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
import { Roles } from '@infrastructure/decorators/roles.decorator';
import {
  CreateCategoriaProductoDto,
  UpdateCategoriaProductoDto,
  CategoriaProductoResponseDto,
  CategoriaProductoListResponseDto,
} from '@gym-saas/shared';
import { CreateCategoriaUseCase } from '@application/use-cases/productos/categorias/create-categoria.use-case';
import { GetAllCategoriasUseCase } from '@application/use-cases/productos/categorias/get-all-categorias.use-case';
import { UpdateCategoriaUseCase } from '@application/use-cases/productos/categorias/update-categoria.use-case';
import { DeleteCategoriaUseCase } from '@application/use-cases/productos/categorias/delete-categoria.use-case';

@Controller('categorias-productos')
@Roles('admin', 'recepcionista')
export class CategoriaProductoController {
  constructor(
    private readonly createCategoriaUseCase: CreateCategoriaUseCase,
    private readonly getAllCategoriasUseCase: GetAllCategoriasUseCase,
    private readonly updateCategoriaUseCase: UpdateCategoriaUseCase,
    private readonly deleteCategoriaUseCase: DeleteCategoriaUseCase,
  ) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateCategoriaProductoDto,
    @Request() req: any,
  ): Promise<CategoriaProductoResponseDto> {
    return this.createCategoriaUseCase.execute(req.user.gimnasioId, createDto);
  }

  @Get()
  async findAll(@Request() req: any): Promise<CategoriaProductoListResponseDto> {
    return this.getAllCategoriasUseCase.execute(req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoriaProductoDto,
    @Request() req: any,
  ): Promise<CategoriaProductoResponseDto> {
    return this.updateCategoriaUseCase.execute(id, req.user.gimnasioId, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteCategoriaUseCase.execute(id, req. user.gimnasioId);
  }
}