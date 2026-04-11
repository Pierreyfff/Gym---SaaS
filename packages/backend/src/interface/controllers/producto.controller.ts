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
  CreateProductoDto,
  UpdateProductoDto,
  ProductoResponseDto,
  ProductoListResponseDto,
} from '@gym-saas/shared';
import { CreateProductoUseCase } from '@application/use-cases/productos/create-producto.use-case';
import { GetAllProductosUseCase } from '@application/use-cases/productos/get-all-productos.use-case';
import { GetProductoByIdUseCase } from '@application/use-cases/productos/get-producto-by-id.use-case';
import { UpdateProductoUseCase } from '@application/use-cases/productos/update-producto.use-case';
import { DeleteProductoUseCase } from '@application/use-cases/productos/delete-producto.use-case';
import { GetLowStockProductosUseCase } from '@application/use-cases/productos/get-low-stock-productos.use-case';

@Controller('productos')
@Roles('admin', 'recepcionista')
export class ProductoController {
  constructor(
    private readonly createProductoUseCase: CreateProductoUseCase,
    private readonly getAllProductosUseCase: GetAllProductosUseCase,
    private readonly getProductoByIdUseCase:  GetProductoByIdUseCase,
    private readonly updateProductoUseCase: UpdateProductoUseCase,
    private readonly deleteProductoUseCase: DeleteProductoUseCase,
    private readonly getLowStockProductosUseCase: GetLowStockProductosUseCase,
  ) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateProductoDto,
    @Request() req: any,
  ): Promise<ProductoResponseDto> {
    return this.createProductoUseCase.execute(req.user.gimnasioId, createDto);
  }

  @Get()
  async findAll(@Request() req: any): Promise<ProductoListResponseDto> {
    return this.getAllProductosUseCase.execute(req.user.gimnasioId);
  }

  @Get('low-stock')
  async getLowStock(@Request() req: any): Promise<ProductoResponseDto[]> {
    return this.getLowStockProductosUseCase.execute(req.user.gimnasioId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any): Promise<ProductoResponseDto> {
    return this.getProductoByIdUseCase.execute(id, req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductoDto,
    @Request() req: any,
  ): Promise<ProductoResponseDto> {
    return this.updateProductoUseCase.execute(id, req.user.gimnasioId, updateDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteProductoUseCase.execute(id, req.user.gimnasioId);
  }
}