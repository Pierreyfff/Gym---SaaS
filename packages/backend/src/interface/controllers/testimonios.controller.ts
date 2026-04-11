import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateTestimonioUseCase } from '@application/use-cases/testimonios/create-testimonio.use-case';
import { GetAllTestimoniosUseCase } from '@application/use-cases/testimonios/get-all-testimonios.use-case';
import { UpdateTestimonioUseCase } from '@application/use-cases/testimonios/update-testimonio.use-case';
import { DeleteTestimonioUseCase } from '@application/use-cases/testimonios/delete-testimonio.use-case';
import { CreateTestimonioDto, UpdateTestimonioDto, TestimonioResponseDto, ListTestimoniosResponseDto } from '@gym-saas/shared';

@Controller('testimonios')
export class TestimoniosController {
  constructor(
    private readonly createTestimonioUseCase: CreateTestimonioUseCase,
    private readonly getAllTestimoniosUseCase: GetAllTestimoniosUseCase,
    private readonly updateTestimonioUseCase: UpdateTestimonioUseCase,
    private readonly deleteTestimonioUseCase: DeleteTestimonioUseCase,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateTestimonioDto, @Request() req: any): Promise<TestimonioResponseDto> {
    return this.createTestimonioUseCase.execute(req.user.gimnasioId, dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  async findAll(@Request() req: any): Promise<ListTestimoniosResponseDto> {
    return this.getAllTestimoniosUseCase.execute(req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTestimonioDto,
    @Request() req: any,
  ): Promise<TestimonioResponseDto> {
    return this.updateTestimonioUseCase.execute(id, req.user.gimnasioId, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.deleteTestimonioUseCase.execute(id, req.user.gimnasioId);
  }
}