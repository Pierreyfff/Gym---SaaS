import { Inject, Injectable } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';
import { UpdatePagoDto } from '@gym-saas/shared';

@Injectable()
export class UpdatePagoUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository:  IPagoRepository,
  ) {}

  async execute(id: string, dto: UpdatePagoDto, gimnasioId?: string) {
    return this.pagoRepository.update(id, {
      notas: dto.notas,
    }, gimnasioId);
  }
}