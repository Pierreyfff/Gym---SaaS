import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangeUserStatusDto,
  UserResponseDto,
  UserListResponseDto,
} from '@gym-saas/shared';
import { Roles } from '@infrastructure/decorators/roles.decorator';
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { GetAllUsersUseCase } from '@application/use-cases/users/get-all-users.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';
import { ChangeUserStatusUseCase } from '@application/use-cases/users/change-user-status.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';

@Controller('users')
@Roles('admin', 'recepcionista') // Solo admin y recepcionistas pueden gestionar usuarios
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getAllUsersUseCase:  GetAllUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changeUserStatusUseCase: ChangeUserStatusUseCase,
    private readonly deleteUserUseCase:  DeleteUserUseCase,
  ) {}

  @Post()
  @Roles('admin') // Solo admin puede crear usuarios
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto, req.user.gimnasioId);
  }

  @Get()
  async findAll(@Request() req: any): Promise<UserListResponseDto> {
    return this.getAllUsersUseCase.execute(req.user.gimnasioId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    return this.getUserByIdUseCase.execute(id, req.user.gimnasioId);
  }

  @Put(':id')
  @Roles('admin') // Solo admin puede actualizar usuarios
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute(id, updateUserDto, req.user.gimnasioId);
  }

  @Patch(':id/status')
  @Roles('admin') // Solo admin puede cambiar estado
  async changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeUserStatusDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    return this.changeUserStatusUseCase.execute(id, changeStatusDto, req.user.gimnasioId);
  }

  @Delete(':id')
  @Roles('admin') // Solo admin puede eliminar usuarios
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteUserUseCase.execute(id, req.user.gimnasioId);
  }
}