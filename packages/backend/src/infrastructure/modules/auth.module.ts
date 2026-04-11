import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from '@interface/controllers/auth.controller';

// Use Cases
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { RegisterClienteUseCase } from '@application/use-cases/auth/register-cliente.use-case';
import { GetCurrentUserUseCase } from '@application/use-cases/auth/get-current-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/auth/change-password.use-case';

// Services & Repositories
import { JwtService as CustomJwtService } from '@infrastructure/services/jwt.service';
import { UserRepository } from '@infrastructure/repositories/user.repository';

// Strategy
import { JwtStrategy } from '@infrastructure/strategies/jwt.strategy';

// Database
import { DatabaseModule } from '@infrastructure/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use Cases
    LoginUseCase,
    RegisterClienteUseCase, // ← NUEVO
    GetCurrentUserUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    
    // Strategy
    JwtStrategy,
    
    // Services
    {
      provide: 'IJwtService',
      useClass: CustomJwtService,
    },
    
    // Repositories
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: ['IJwtService', JwtStrategy],
})
export class AuthModule {}