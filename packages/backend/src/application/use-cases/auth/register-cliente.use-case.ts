import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { RegisterClienteDto, LoginResponseDto, UserDto } from '@gym-saas/shared';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IJwtService } from '@domain/services/jwt.service.interface';
import { PrismaClient } from '@gym-saas/database';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterClienteUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    private readonly prisma: PrismaClient,
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

    // Crear usuario + PerfilCliente en una sola transacción atómica
    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          gimnasioId: gimnasio.id,
          email: dto.email,
          contrasenaHash: hashedPassword,
          nombre: dto.nombre,
          apellido: dto.apellido,
          telefono: dto.telefono,
          rol: 'cliente',
          perfilCliente: {
            create: {
              fechaNacimiento: null,
              genero: null,
              notas: null,
            },
          },
        },
      });
      return user;
    });

    // Generar tokens
    const payload = { 
      sub: newUser.id,
      email: newUser.email, 
      rol: newUser.rol,
      gimnasioId: newUser.gimnasioId,
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(payload),
      this.jwtService.generateRefreshToken(payload),
    ]);

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