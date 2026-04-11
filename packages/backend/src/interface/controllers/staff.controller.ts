import { Controller, Get, Post, Put, Delete, Body, Param, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateStaffUseCase } from '@application/use-cases/staff/create-staff.use-case';
import { GetAllStaffUseCase } from '@application/use-cases/staff/get-all-staff.use-case';
import { UpdateStaffUseCase } from '@application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '@application/use-cases/staff/delete-staff.use-case';
import { CreateStaffDto, UpdateStaffDto, StaffResponseDto, StaffListResponseDto } from '@gym-saas/shared';

@Controller('staff')
export class StaffController {
  constructor(
    private readonly createStaffUseCase: CreateStaffUseCase,
    private readonly getAllStaffUseCase: GetAllStaffUseCase,
    private readonly updateStaffUseCase: UpdateStaffUseCase,
    private readonly deleteStaffUseCase: DeleteStaffUseCase,
  ) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateStaffDto, @Request() req: any): Promise<StaffResponseDto> {
    return this.createStaffUseCase.execute(req.user.gimnasioId, dto);
  }

  @Get()
  @Roles('admin', 'recepcionista')
  async findAll(@Request() req: any): Promise<StaffListResponseDto> {
    return this.getAllStaffUseCase.execute(req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Request() req: any,
  ): Promise<StaffResponseDto> {
    return this.updateStaffUseCase.execute(id, req.user.gimnasioId, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.deleteStaffUseCase.execute(id, req.user.gimnasioId);
  }
}