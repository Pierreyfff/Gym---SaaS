import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';

@Injectable()
export class DeleteMembresiaUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository:  IMembresiaRepository,
  ) {}

  async execute(id: string, gimnasioId:  string): Promise<void> {
    // 1. Verificar que existe
    const membresia = await this.membresiaRepository.findById(id);

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 2. Verificar que pertenece al gimnasio
    if (membresia.membresia.gimnasioId !== gimnasioId) {
      throw new NotFoundException('Membresía no encontrada');
    }

    // 3. Eliminar
    await this.membresiaRepository.delete(id);
  }
}