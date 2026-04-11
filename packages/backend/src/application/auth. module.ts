import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Use Cases
import { LoginUseCase } from './use-cases/auth/login.use-case';

// Controllers
import { AuthController } from '@interface/controllers/auth.controller';

// Repositories
import { UserRepository } from '@infrastructure/repositories/user.repository';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

// Services
import { JwtService as CustomJwtService } from '@infrastructure/services/jwt.service';
import { IJwtService } from '@domain/services/jwt.service.interface';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,

    // Repositories (inyección con interfaz)
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },

    // Services (inyección con interfaz)
    {
      provide: 'IJwtService',
      useClass: CustomJwtService,
    },
  ],
})
export class AuthModule {}