import { Module } from '@nestjs/common';

// Controller
import { PlanesController } from '@interface/controllers/planes.controller';

// Use Cases
import { CreatePlanUseCase } from '@application/use-cases/planes/create-plan.use-case';
import { GetAllPlanesUseCase } from '@application/use-cases/planes/get-all-planes.use-case';
import { GetPlanByIdUseCase } from '@application/use-cases/planes/get-plan-by-id.use-case';
import { UpdatePlanUseCase } from '@application/use-cases/planes/update-plan.use-case';
import { DeletePlanUseCase } from '@application/use-cases/planes/delete-plan.use-case';

// Repository
import { PlanRepository } from '@infrastructure/repositories/plan.repository';

// Database
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanesController],
  providers:  [
    // Use Cases
    CreatePlanUseCase,
    GetAllPlanesUseCase,
    GetPlanByIdUseCase,
    UpdatePlanUseCase,
    DeletePlanUseCase,

    // Repository
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
  ],
  exports: ['IPlanRepository'], // Exportar para usarlo en membresías
})
export class PlanesModule {}