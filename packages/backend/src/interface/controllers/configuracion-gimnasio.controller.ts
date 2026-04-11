import { Controller, Get, Put, Body, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { GetConfiguracionUseCase } from '@application/use-cases/configuracion/get-configuracion.use-case';
import { UpdateConfiguracionUseCase } from '@application/use-cases/configuracion/update-configuracion.use-case';
import { UpdateConfiguracionGimnasioDto, ConfiguracionGimnasioResponseDto } from '@gym-saas/shared';

@Controller('configuracion')
export class ConfiguracionGimnasioController {
  constructor(
    private readonly getConfiguracionUseCase: GetConfiguracionUseCase,
    private readonly updateConfiguracionUseCase: UpdateConfiguracionUseCase,
  ) {}

  @Get()
  @Roles('admin', 'staff')
  async getConfiguracion(@Request() req: any): Promise<ConfiguracionGimnasioResponseDto> {
    return this.getConfiguracionUseCase.execute(req.user.gimnasioId);
  }

  @Put()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateConfiguracion(
    @Body() updateDto: UpdateConfiguracionGimnasioDto,
    @Request() req: any,
  ): Promise<ConfiguracionGimnasioResponseDto> {
    return this.updateConfiguracionUseCase.execute(req. user.gimnasioId, updateDto);
  }
}