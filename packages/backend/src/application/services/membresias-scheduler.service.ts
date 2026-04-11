import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@gym-saas/database';

@Injectable()
export class MembresiasSchedulerService {
  private readonly logger = new Logger(MembresiasSchedulerService.name);

  constructor(private readonly prisma: PrismaClient) {}

  // Corre todos los días a las 00:01 AM
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async expirarMembresiasVencidas() {
    this.logger.log('Iniciando tarea:  Expirar membresías vencidas');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Buscar membresías activas con fechaFin < hoy
      const result = await this.prisma.membresia.updateMany({
        where: {
          estado: 'activa',
          fechaFin: {
            lt: hoy,
          },
        },
        data: {
          estado: 'expirada',
        },
      });

      this.logger.log(
        `✅ ${result.count} membresías expiradas automáticamente`,
      );
    } catch (error) {
      this.logger.error('❌ Error expirando membresías:', error);
    }
  }

  // Opcional: Corre cada hora (para testing)
  // @Cron(CronExpression.EVERY_HOUR)
  // async expirarMembresiasVencidasTest() {
  //   await this.expirarMembresiasVencidas();
  // }
}
