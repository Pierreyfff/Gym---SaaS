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
  CreatePlanDto,
  UpdatePlanDto,
  PlanResponseDto,
  PlanListResponseDto,
} from '@gym-saas/shared';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreatePlanUseCase } from '@application/use-cases/planes/create-plan.use-case';
import { GetAllPlanesUseCase } from '@application/use-cases/planes/get-all-planes.use-case';
import { GetPlanByIdUseCase } from '@application/use-cases/planes/get-plan-by-id.use-case';
import { UpdatePlanUseCase } from '@application/use-cases/planes/update-plan.use-case';
import { DeletePlanUseCase } from '@application/use-cases/planes/delete-plan.use-case';

@Controller('planes')
@Roles('admin', 'recepcionista')
export class PlanesController {
  constructor(
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly getAllPlanesUseCase: GetAllPlanesUseCase,
    private readonly getPlanByIdUseCase: GetPlanByIdUseCase,
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly deletePlanUseCase: DeletePlanUseCase,
  ) {}

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPlanDto: CreatePlanDto,
    @Request() req: any,
  ): Promise<PlanResponseDto> {
    return this.createPlanUseCase.execute(createPlanDto, req.user.gimnasioId);
  }

  @Get()
  async findAll(@Request() req: any): Promise<PlanListResponseDto> {
    return this.getAllPlanesUseCase.execute(req.user.gimnasioId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<PlanResponseDto> {
    return this.getPlanByIdUseCase.execute(id, req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @Request() req: any,
  ): Promise<PlanResponseDto> {
    return this.updatePlanUseCase.execute(id, updatePlanDto, req.user.gimnasioId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deletePlanUseCase.execute(id, req.user.gimnasioId);
  }
}