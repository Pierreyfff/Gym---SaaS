import { Injectable, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IClienteRepository } from '@domain/repositories/cliente.repository.interface';
import { CreateClienteDto, ClienteResponseDto } from '@gym-saas/shared';
import { EmailService } from '@application/services/email.service';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
    private readonly emailService: EmailService, // ← AGREGAR
  ) {}

  async execute(
    dto: CreateClienteDto,
    gimnasioId: string,
  ): Promise<ClienteResponseDto> {
    // 1. Validar que no exista un cliente con ese email (BLOQUEAR)
    const existeEmail = await this.clienteRepository.findByEmailAndGimnasio(
      dto.email,
      gimnasioId,
    );

    if (existeEmail) {
      throw new ConflictException(
        `Ya existe un cliente con el email ${dto.email} en este gimnasio`,
      );
    }

    // 2. Verificar posible duplicado por nombre+apellido+teléfono (ALERTAR)
    let advertencia = undefined;

    if (dto.telefono) {
      const posibleDuplicado =
        await this.clienteRepository.findByNombreApellidoTelefono(
          dto.nombre,
          dto.apellido,
          dto.telefono,
          gimnasioId,
        );

      if (posibleDuplicado) {
        advertencia = {
          tipo: 'posible_duplicado',
          mensaje: `⚠️ Ya existe un cliente con el mismo nombre, apellido y teléfono:  ${posibleDuplicado.usuario.email}`,
          clienteExistenteId: posibleDuplicado.usuario.id,
        };
      }
    }

    // 3. Hashear contraseña
    const contrasenaHash = await bcrypt.hash(dto.password, 10);

    // 4. Preparar fecha de nacimiento
    const fechaNacimiento = dto.fechaNacimiento
      ? new Date(dto.fechaNacimiento)
      : undefined;

    // 5. Crear cliente con perfil
    const clienteConPerfil = await this.clienteRepository.create({
      gimnasioId,
      email: dto.email,
      contrasenaHash,
      nombre: dto.nombre,
      apellido: dto.apellido,
      telefono: dto.telefono,
      fechaNacimiento,
      genero: dto.genero,
      notas: dto.notas,
    });

    // 7. Enviar email de bienvenida
    await this.emailService.enviarBienvenida(
      clienteConPerfil.usuario.email,
      `${clienteConPerfil.usuario.nombre} ${clienteConPerfil.usuario.apellido}`,
    );

    // 6. Mapear a DTO de respuesta
    return {
      id: clienteConPerfil.usuario.id,
      email: clienteConPerfil.usuario.email,
      nombre: clienteConPerfil.usuario.nombre,
      apellido: clienteConPerfil.usuario.apellido,
      telefono: clienteConPerfil.usuario.telefono || undefined,
      estado: clienteConPerfil.usuario.estado,
      gimnasioId: clienteConPerfil.usuario.gimnasioId,
      perfil: {
        fechaNacimiento: clienteConPerfil.perfil.fechaNacimiento || undefined,
        genero: clienteConPerfil.perfil.genero || undefined,
        notas: clienteConPerfil.perfil.notas || undefined,
        edad: clienteConPerfil.perfil.calcularEdad() || undefined,
      },
      advertencia, // ← AGREGAR advertencia si existe
      fechaCreacion: clienteConPerfil.usuario.fechaCreacion,
      fechaActualizacion: clienteConPerfil.usuario.fechaActualizacion,
    };
  }
}
