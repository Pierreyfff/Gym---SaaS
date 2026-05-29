import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import {
  IClienteRepository,
  ClienteConPerfil,
  CreateClienteData,
  UpdateClienteData,
  UpdatePerfilClienteData,
} from '@domain/repositories/cliente.repository.interface';
import { UserEntity } from '@domain/entities/user.entity';
import { PerfilClienteEntity } from '@domain/entities/perfil-cliente.entity';

@Injectable()
export class ClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllByGimnasio(gimnasioId: string): Promise<ClienteConPerfil[]> {
    const usuarios = await this.prisma.usuario.findMany({
      where: {
        gimnasioId,
        rol: 'cliente',
      },
      include: {
        perfilCliente: true,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    // Crear perfiles faltantes en transacción
    const usuariosSinPerfil = usuarios.filter((u) => !u.perfilCliente);
    if (usuariosSinPerfil.length > 0) {
      await this.prisma.$transaction(
        usuariosSinPerfil.map((u) =>
          this.prisma.perfilCliente.create({
            data: {
              usuarioId: u.id,
              fechaNacimiento: null,
              genero: null,
              notas: null,
            },
          }),
        ),
      );

      // Recargar con perfiles creados
      const usuariosActualizados = await this.prisma.usuario.findMany({
        where: {
          gimnasioId,
          rol: 'cliente',
        },
        include: {
          perfilCliente: true,
        },
        orderBy: {
          fechaCreacion: 'desc',
        },
      });
      return await Promise.all(
        usuariosActualizados.map((u) => this.mapToClienteConPerfil(u)),
      );
    }

    return await Promise.all(
      usuarios.map((u) => this.mapToClienteConPerfil(u)),
    );
  }

  async findById(id: string): Promise<ClienteConPerfil | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        perfilCliente: true,
      },
    });

    if (!usuario || usuario.rol !== 'cliente') {
      return null;
    }

    // Auto-crear perfil si no existe
    if (!usuario.perfilCliente) {
      await this.ensurePerfilExists(usuario.id);
      const usuarioConPerfil = await this.prisma.usuario.findUnique({
        where: { id },
        include: { perfilCliente: true },
      });
      return await this.mapToClienteConPerfil(usuarioConPerfil);
    }

    return await this.mapToClienteConPerfil(usuario);
  }

  async findByEmailAndGimnasio(
    email: string,
    gimnasioId: string,
  ): Promise<ClienteConPerfil | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        email,
        gimnasioId,
        rol: 'cliente',
      },
      include: {
        perfilCliente: true,
      },
    });

    if (!usuario) return null;

    return await this.mapToClienteConPerfil(usuario);
  }

  async findByNombreApellidoTelefono(
    nombre: string,
    apellido: string,
    telefono: string,
    gimnasioId: string,
  ): Promise<ClienteConPerfil | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        gimnasioId,
        rol: 'cliente',
        nombre: {
          equals: nombre,
          mode: 'insensitive',
        },
        apellido: {
          equals: apellido,
          mode: 'insensitive',
        },
        telefono,
      },
      include: {
        perfilCliente: true,
      },
    });

    if (!usuario) return null;

    return await this.mapToClienteConPerfil(usuario);
  }

  async create(data: CreateClienteData): Promise<ClienteConPerfil> {
    const usuario = await this.prisma.usuario.create({
      data: {
        gimnasioId: data.gimnasioId,
        email: data.email,
        contrasenaHash: data.contrasenaHash,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        rol: 'cliente',
        perfilCliente: {
          create: {
            fechaNacimiento: data.fechaNacimiento,
            genero: data.genero,
            notas: data.notas,
          },
        },
      },
      include: {
        perfilCliente: true,
      },
    });

    return await this.mapToClienteConPerfil(usuario);
  }

  async update(
    id: string,
    userData: UpdateClienteData,
    perfilData: UpdatePerfilClienteData,
  ): Promise<ClienteConPerfil> {
    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: {
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        perfilCliente: {
          upsert: {
            create: {
              fechaNacimiento: perfilData.fechaNacimiento,
              genero: perfilData.genero,
              notas: perfilData.notas,
            },
            update: {
              fechaNacimiento: perfilData.fechaNacimiento,
              genero: perfilData.genero,
              notas: perfilData.notas,
            },
          },
        },
      },
      include: {
        perfilCliente: true,
      },
    });

    return await this.mapToClienteConPerfil(usuario);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  async ensurePerfilExists(usuarioId: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { perfilCliente: true },
    });

    if (usuario && usuario.rol === 'cliente' && !usuario.perfilCliente) {
      await this.prisma.perfilCliente.create({
        data: {
          usuarioId: usuarioId,
          fechaNacimiento: null,
          genero: null,
          notas: null,
        },
      });
    }
  }

  private async mapToClienteConPerfil(data: any): Promise<ClienteConPerfil> {
    const usuario = new UserEntity(
      data.id,
      data.gimnasioId,
      data.email,
      data.contrasenaHash,
      data.nombre,
      data.apellido,
      data.telefono,
      data.rol,
      data.estado,
      data.fechaCreacion,
      data.fechaActualizacion,
    );

    let perfilData = data.perfilCliente;

    // Auto-crear perfil en DB si no existe
    if (!perfilData) {
      perfilData = await this.prisma.perfilCliente.create({
        data: {
          usuarioId: data.id,
          fechaNacimiento: null,
          genero: null,
          notas: null,
        },
      });
    }

    const perfil = new PerfilClienteEntity(
      perfilData.id,
      perfilData.usuarioId,
      perfilData.fechaNacimiento,
      perfilData.genero,
      perfilData.notas,
      perfilData.fechaCreacion,
      perfilData.fechaActualizacion,
    );

    return { usuario, perfil };
  }
}
