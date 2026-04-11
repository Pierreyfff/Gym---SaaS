import { Module } from '@nestjs/common';

// Controller
import { MembresiasController } from '@interface/controllers/membresias.controller';

// Use Cases
import { CreateMembresiaUseCase } from '@application/use-cases/membresias/create-membresia.use-case';
import { GetAllMembresiasUseCase } from '@application/use-cases/membresias/get-all-membresias.use-case';
import { GetMembresiaByIdUseCase } from '@application/use-cases/membresias/get-membresia-by-id.use-case';
import { GetMembresiasByClienteUseCase } from '@application/use-cases/membresias/get-membresias-by-cliente.use-case';
import { UpdateMembresiaUseCase } from '@application/use-cases/membresias/update-membresia.use-case';
import { CancelarMembresiaUseCase } from '@application/use-cases/membresias/cancelar-membresia.use-case';
import { DeleteMembresiaUseCase } from '@application/use-cases/membresias/delete-membresia.use-case';
import { RenovarMembresiaUseCase } from '@application/use-cases/membresias/renovar-membresia.use-case';
import { CambiarPlanMembresiaUseCase } from '@application/use-cases/membresias/cambiar-plan-membresia.use-case';

// Repositories
import { MembresiaRepository } from '@infrastructure/repositories/membresia.repository';
import { ClienteRepository } from '@infrastructure/repositories/cliente.repository';
import { PlanRepository } from '@infrastructure/repositories/plan.repository';

// Modules
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MembresiasController],
  providers: [
    // Use Cases
    CreateMembresiaUseCase,
    GetAllMembresiasUseCase,
    GetMembresiaByIdUseCase,
    GetMembresiasByClienteUseCase,
    UpdateMembresiaUseCase,
    CancelarMembresiaUseCase,
    DeleteMembresiaUseCase,
    RenovarMembresiaUseCase,
    CambiarPlanMembresiaUseCase,

    // Repositories
    {
      provide: 'IMembresiaRepository',
      useClass: MembresiaRepository,
    },
    {
      provide: 'IClienteRepository',
      useClass: ClienteRepository,
    },
    {
      provide: 'IPlanRepository',
      useClass: PlanRepository,
    },
  ],
  exports: [
    'IMembresiaRepository',
    'IClienteRepository',
    'IPlanRepository',
  ],
})
export class MembresiasModule {}