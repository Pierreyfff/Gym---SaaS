import { Module } from '@nestjs/common';

// Controller
import { UsersController } from '@interface/controllers/users.controller';

// Use Cases
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { GetAllUsersUseCase } from '@application/use-cases/users/get-all-users.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';
import { ChangeUserStatusUseCase } from '@application/use-cases/users/change-user-status.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';

// Repository
import { UserRepository } from '@infrastructure/repositories/user.repository';

// Database
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [
    // Use Cases
    CreateUserUseCase,
    GetAllUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    ChangeUserStatusUseCase,
    DeleteUserUseCase,

    // Repository
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}