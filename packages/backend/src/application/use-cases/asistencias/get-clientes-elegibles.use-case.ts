import { Injectable, Inject } from '@nestjs/common';
import { IMembresiaRepository } from '@domain/repositories/membresia.repository.interface';
import { IAsistenciaRepository, ASISTENCIA_REPOSITORY } from '@domain/repositories/asistencia.repository.interface';

@Injectable()
export class GetClientesElegiblesUseCase {
  constructor(
    @Inject('IMembresiaRepository')
    private readonly membresiaRepository: IMembresiaRepository,
    @Inject(ASISTENCIA_REPOSITORY)
    private readonly asistenciaRepository: IAsistenciaRepository,
  ) {}

  async execute(gimnasioId: string) {
    // 1. Obtener todos los clientes con membresía activa
    const membresiasActivas = await this.membresiaRepository.findAllByGimnasio(gimnasioId);
    
    const clientesConMembresiaActiva = membresiasActivas.filter(
      (m) => m.membresia.estado === 'activa'
    );

    // 2. Obtener asistencias de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const asistenciasHoy = await this.asistenciaRepository.findByDateRange(
      gimnasioId,
      hoy,
      manana
    );

    const clientesConAsistenciaHoy = new Set(
      asistenciasHoy.map((a) => a.asistencia.clienteId)
    );

    // 3. Filtrar clientes que NO tienen asistencia hoy
    const clientesElegibles = clientesConMembresiaActiva
      .filter((m) => !clientesConAsistenciaHoy.has(m.cliente.id))
      .map((m) => ({
        cliente: m.cliente,
        membresia: m.membresia,
        plan: m.plan,
      }));

    return clientesElegibles;
  }
}