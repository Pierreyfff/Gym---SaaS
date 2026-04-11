import { Injectable, Inject } from '@nestjs/common';
import { IVentaProductoRepository } from '@domain/repositories/venta-producto.repository.interface';
import { CreateVentaProductoDto, VentaProductoResponseDto } from '@gym-saas/shared';

@Injectable()
export class CreateVentaUseCase {
  constructor(
    @Inject('IVentaProductoRepository')
    private readonly ventaRepository: IVentaProductoRepository,
  ) {}

  async execute(
    gimnasioId: string,
    userId: string,
    dto: CreateVentaProductoDto,
  ): Promise<VentaProductoResponseDto[]> {
    return this.ventaRepository.create(gimnasioId, userId, dto);
  }
}