import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateInscripcionDto, InscripcionResponseDto } from '@gym-saas/shared';
import { CreateInscripcionUseCase } from '@application/use-cases/inscripciones/create-inscripcion.use-case';

@Controller('inscripciones')
@Roles('admin', 'recepcionista')
export class InscripcionesController {
  constructor(
    private readonly createInscripcionUseCase: CreateInscripcionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInscripcionDto: CreateInscripcionDto,
    @Request() req: any,
  ): Promise<InscripcionResponseDto> {
    return this.createInscripcionUseCase.execute(
      createInscripcionDto,
      req.user.gimnasioId,
    );
  }
}