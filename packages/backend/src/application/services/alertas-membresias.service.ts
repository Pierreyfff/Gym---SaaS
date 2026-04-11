import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@gym-saas/database';
import { EmailService } from './email.service';

@Injectable()
export class AlertasMembresiasService {
  private readonly logger = new Logger(AlertasMembresiasService. name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: EmailService,
  ) {}

  // Cron que corre todos los días a las 9: 00 AM
  @Cron(CronExpression. EVERY_DAY_AT_9AM)
  async enviarAlertasVencimiento() {
    this.logger.log('🔔 Iniciando envío de alertas de vencimiento.. .');

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Buscar membresías activas que vencen en 7, 3 o 1 día
      const diasAlerta = [7, 3, 1];
      let totalAlertas = 0;

      for (const dias of diasAlerta) {
        const fechaLimite = new Date(hoy);
        fechaLimite.setDate(fechaLimite.getDate() + dias);
        fechaLimite.setHours(23, 59, 59, 999);

        const fechaInicio = new Date(fechaLimite);
        fechaInicio.setHours(0, 0, 0, 0);

        const membresias = await this.prisma.membresia.findMany({
          where: {
            estado: 'activa',
            fechaFin: {
              gte: fechaInicio,
              lte: fechaLimite,
            },
          },
          include: {
            cliente: {
              select: {
                email:  true,
                nombre: true,
                apellido: true,
              },
            },
            plan: {
              select: {
                nombre: true,
              },
            },
          },
        });

        this.logger.log(`📧 Enviando ${membresias.length} alertas para membresías que vencen en ${dias} día(s)`);

        for (const membresia of membresias) {
          await this.emailService.enviarAlertaVencimiento(
            membresia.cliente.email,
            `${membresia.cliente.nombre} ${membresia.cliente. apellido}`,
            membresia.plan.nombre,
            membresia.fechaFin,
            dias,
          );
          totalAlertas++;
        }
      }

      this. logger.log(`✅ Total de alertas enviadas: ${totalAlertas}`);
    } catch (error) {
      this.logger.error('❌ Error enviando alertas de vencimiento:', error);
    }
  }

  // Método manual para testing
  async enviarAlertasManual() {
    this.logger.log('🧪 Enviando alertas manualmente (testing)...');
    await this.enviarAlertasVencimiento();
  }
}