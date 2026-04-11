import { Body, Controller, Post, Get, Patch, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { 
  LoginDto, 
  LoginResponseDto, 
  UserDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  ChangePasswordDto,
  RegisterClienteDto,
} from '@gym-saas/shared';
import { RegisterClienteUseCase } from '@application/use-cases/auth/register-cliente.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { GetCurrentUserUseCase } from '@application/use-cases/auth/get-current-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/auth/change-password.use-case';
import { Public } from '@infrastructure/decorators/public.decorator';
import { Roles } from '@infrastructure/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase:  LoginUseCase,
    private readonly registerClienteUseCase: RegisterClienteUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly refreshTokenUseCase:  RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.loginUseCase.execute(loginDto);
  }
    @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterClienteDto): Promise<LoginResponseDto> {
    return this.registerClienteUseCase.execute(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Get('me')
  async getCurrentUser(@Request() req: any): Promise<UserDto> {
    return this.getCurrentUserUseCase.execute(req.user.userId);
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto): Promise<void> {
    return this.changePasswordUseCase.execute(req.user.userId, dto);
  }

  @Get('admin-only')
  @Roles('admin')
  testAdminOnly(@Request() req: any) {
    return {
      message: '✅ Acceso concedido - Solo admins',
      user: req.user,
    };
  }

  @Get('staff-only')
  @Roles('admin', 'recepcionista')
  testStaffOnly(@Request() req: any) {
    return {
      message: '✅ Acceso concedido - Staff',
      user: req.user,
    };
  }

  @Get('test')
  testProtected(@Request() req: any) {
    return {
      message: '✅ Ruta protegida - Token válido',
      user: req.user,
    };
  }
}