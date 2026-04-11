import { Module } from '@nestjs/common';

// Controller
import { ClientesController } from '@interface/controllers/clientes.controller';

// Use Cases
import { CreateClienteUseCase } from '@application/use-cases/clientes/create-cliente.use-case';
import { GetAllClientesUseCase } from '@application/use-cases/clientes/get-all-clientes.use-case';
import { GetClienteByIdUseCase } from '@application/use-cases/clientes/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '@application/use-cases/clientes/update-cliente.use-case';
import { DeleteClienteUseCase } from '@application/use-cases/clientes/delete-cliente.use-case';
import { GetClientesDisponiblesMembresiaUseCase } from '@application/use-cases/clientes/get-clientes-disponibles-membresia.use-case';
import { GetClientePerfilCompletoUseCase } from '@application/use-cases/clientes/get-cliente-perfil-completo.use-case';

// Repositories
import { ClienteRepository } from '@infrastructure/repositories/cliente.repository';
import { MembresiaRepository } from '@infrastructure/repositories/membresia.repository';

// Database
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ClientesController],
  providers: [
    // Use Cases
    CreateClienteUseCase,
    GetAllClientesUseCase,
    GetClienteByIdUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
    GetClientesDisponiblesMembresiaUseCase,
    GetClientePerfilCompletoUseCase,

    // Repositories
    {
      provide: 'IClienteRepository',
      useClass: ClienteRepository,
    },
    {
      provide: 'IMembresiaRepository',
      useClass: MembresiaRepository,
    },
  ],
})
export class ClientesModule {}