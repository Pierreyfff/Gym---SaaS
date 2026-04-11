import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  IPagoRepository,
  PAGO_REPOSITORY,
} from '@domain/repositories/pago.repository.interface';
import {
  IMembresiaRepository,
} from '@domain/repositories/membresia.repository.interface';
import { ReembolsarPagoDto } from '@gym-saas/shared';

@Injectable()
export class ReembolsarPagoUseCase {
  constructor(
    @Inject(PAGO_REPOSITORY)
    private readonly pagoRepository: IPagoRepository,
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
  ) {}

  async execute(pagoId: string, gimnasioId: string, dto: ReembolsarPagoDto) {
    // 1. Obtener el pago
    const pagoConRelaciones = await this.pagoRepository.findById(pagoId);

    if (!pagoConRelaciones) {
      throw new BadRequestException('Pago no encontrado');
    }

    // 2. Verificar que pertenece al gimnasio
    if (pagoConRelaciones.pago.gimnasioId !== gimnasioId) {
      throw new BadRequestException('Pago no encontrado');
    }

    // 3. Verificar que puede reembolsarse
    if (!pagoConRelaciones.pago.puedeReembolsarse()) {
      throw new BadRequestException(
        `No se puede reembolsar un pago con estado "${pagoConRelaciones.pago.estado}"`
      );
    }

    // 4. Verificar el estado de la membresía
    const membresiaEstado = pagoConRelaciones.membresia.estado;

    if (membresiaEstado === 'activa') {
      throw new BadRequestException(
        'No se puede reembolsar un pago de una membresía activa.  Primero debes cancelar la membresía.'
      );
    }

    // 5. Reembolsar el pago
    return this.pagoRepository.reembolsar(pagoId, {
      motivo: dto.motivo,
      notas: dto.notas,
    });
  }
}