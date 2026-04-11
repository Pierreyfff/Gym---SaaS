import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { RegisterClienteDto, LoginResponseDto, UserDto } from '@gym-saas/shared';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { PrismaService } from '@infrastructure/database/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegisterClienteUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RegisterClienteDto): Promise<LoginResponseDto> {
    // Obtener el único gimnasio del sistema
    const gimnasio = await this.prisma.gimnasio.findFirst();
    
    if (!gimnasio) {
      throw new NotFoundException('No se encontró configuración del gimnasio');
    }

    // Verificar si el email ya existe en este gimnasio
    const existingUser = await this.userRepository.findByEmailAndGimnasio(
      dto.email,
      gimnasio.id,
    );
    
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario con rol "cliente"
    const newUser = await this.userRepository.create({
      email: dto.email,
      contrasenaHash: hashedPassword,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      rol: 'cliente',
      gimnasioId: gimnasio.id,
    });

    // Generar tokens
    const payload = { 
      userId: newUser.id, 
      email: newUser.email, 
      rol: newUser.rol,
      gimnasioId: newUser.gimnasioId,
    };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const userDto: UserDto = {
      id: newUser.id,
      email: newUser.email,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      telefono: newUser.telefono,
      rol: newUser.rol,
      estado: newUser.estado,
      gimnasioId: newUser.gimnasioId,
    };

    return {
      accessToken,
      refreshToken,
      user: userDto,
    };
  }
}