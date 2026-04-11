import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateImagenGaleriaUseCase } from '@application/use-cases/galeria/create-imagen.use-case';
import { GetAllImagenesGaleriaUseCase } from '@application/use-cases/galeria/get-all-imagenes.use-case';
import { UpdateImagenGaleriaUseCase } from '@application/use-cases/galeria/update-imagen.use-case';
import { DeleteImagenGaleriaUseCase } from '@application/use-cases/galeria/delete-imagen.use-case';
import { CreateImagenGaleriaDto, UpdateImagenGaleriaDto, ImagenGaleriaResponseDto, ListImagenesGaleriaResponseDto } from '@gym-saas/shared';

@Controller('galeria')
export class GaleriaController {
  constructor(
    private readonly createImagenUseCase: CreateImagenGaleriaUseCase,
    private readonly getAllImagenesUseCase: GetAllImagenesGaleriaUseCase,
    private readonly updateImagenUseCase: UpdateImagenGaleriaUseCase,
    private readonly deleteImagenUseCase: DeleteImagenGaleriaUseCase,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateImagenGaleriaDto, @Request() req: any): Promise<ImagenGaleriaResponseDto> {
    return this.createImagenUseCase.execute(req.user.gimnasioId, dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  async findAll(@Request() req: any): Promise<ListImagenesGaleriaResponseDto> {
    return this.getAllImagenesUseCase.execute(req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateImagenGaleriaDto,
    @Request() req: any,
  ): Promise<ImagenGaleriaResponseDto> {
    return this.updateImagenUseCase.execute(id, req.user.gimnasioId, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.deleteImagenUseCase.execute(id, req.user.gimnasioId);
  }
}