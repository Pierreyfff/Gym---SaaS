import { Inject, Injectable } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';
import { CreatePagoDto } from '@gym-saas/shared';

@Injectable()
export class CreatePagoUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository: IPagoRepository,
  ) {}

  async execute(gimnasioId: string, clienteId: string, dto: CreatePagoDto) {
    return this.pagoRepository.create({
      gimnasioId,
      membresiaId: dto.membresiaId,
      clienteId,
      monto: dto.monto,
      metodoPago: dto.metodoPago as 'efectivo' | 'tarjeta' | 'transferencia',
      notas: dto.notas,
    });
  }
}