import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { 
  IUserRepository, 
  CreateUserData,
  UpdateUserData 
} from '@domain/repositories/user.repository.interface';
import { UserEntity } from '@domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmailAndGimnasio(
    email: string,
    gimnasioId: string,
  ): Promise<UserEntity | null> {
    const user = await this.prisma.usuario.findUnique({
      where: {
        gimnasioId_email: {
          gimnasioId,
          email,
        },
      },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findAllByGimnasio(gimnasioId: string): Promise<UserEntity[]> {
    const users = await this.prisma.usuario.findMany({
      where: { gimnasioId },
      orderBy: { fechaCreacion: 'desc' },
    });

    return users.map((user) => this.mapToEntity(user));
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.usuario.create({
      data: {
        gimnasioId: data.gimnasioId,
        email: data.email,
        contrasenaHash: data.contrasenaHash,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono:  data.telefono,
        rol: data.rol,
      },
    });

    return this.mapToEntity(user);
  }

  async update(id:  string, data: UpdateUserData): Promise<UserEntity> {
    const user = await this.prisma.usuario.update({
      where: { id },
      data:  {
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        rol: data.rol,
      },
    });

    return this.mapToEntity(user);
  }

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id },
      data: { contrasenaHash: newPasswordHash },
    });
  }

  async delete(id:  string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id },
    });
  }

  async changeStatus(
    id: string,
    estado: 'activo' | 'inactivo',
  ): Promise<UserEntity> {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { estado },
    });

    return this.mapToEntity(user);
  }

  private mapToEntity(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.gimnasioId,
      user.email,
      user.contrasenaHash,
      user.nombre,
      user.apellido,
      user.telefono,
      user.rol,
      user.estado,
      user.fechaCreacion,
      user.fechaActualizacion,
    );
  }
}