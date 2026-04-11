import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend:  Resend | null;
  private readonly fromEmail: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.enabled = true;
      this.logger.log('✅ Email service habilitado');
    } else {
      this.resend = null;
      this. enabled = false;
      this. logger.warn('⚠️ Email service deshabilitado (falta RESEND_API_KEY)');
    }
  }

  async enviarBienvenida(toEmail: string, nombre: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`📧 Email deshabilitado:  Bienvenida a ${toEmail}`);
      return;
    }

    try {
      await this.resend! .emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: '¡Bienvenido a Gym SaaS!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">¡Bienvenido, ${nombre}!</h1>
            <p>Tu cuenta ha sido creada exitosamente en nuestro gimnasio. </p>
            <p>Ya puedes comenzar a disfrutar de todos nuestros servicios.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">Este es un correo automático, por favor no respondas. </p>
          </div>
        `,
      });

      this.logger.log(`✅ Email de bienvenida enviado a ${toEmail}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando email de bienvenida a ${toEmail}:`, error);
    }
  }

  async enviarAlertaVencimiento(
    toEmail: string,
    nombre: string,
    planNombre: string,
    fechaVencimiento: Date,
    diasRestantes: number,
  ): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`📧 Email deshabilitado: Alerta vencimiento a ${toEmail}`);
      return;
    }

    const urgencia = diasRestantes <= 3 ? 'URGENTE' : 'PRÓXIMO';
    const color = diasRestantes <= 3 ? '#ef4444' : '#f59e0b';

    try {
      await this. resend!.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: `${urgencia}:  Tu membresía vence en ${diasRestantes} día${diasRestantes === 1 ?  '' : 's'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">⚠️ Tu membresía está por vencer</h1>
            </div>
            <div style="padding: 20px; border:  1px solid #e5e7eb; border-top: none;">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Tu membresía <strong>${planNombre}</strong> vence en <strong>${diasRestantes} día${diasRestantes === 1 ? '' : 's'}</strong>.</p>
              <p><strong>Fecha de vencimiento:</strong> ${fechaVencimiento.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
              <p style="margin-top: 30px;">
                <a href="#" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Renovar Membresía
                </a>
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Email de alerta enviado a ${toEmail} (${diasRestantes} días restantes)`);
    } catch (error) {
      this.logger.error(`❌ Error enviando alerta de vencimiento a ${toEmail}:`, error);
    }
  }

  async enviarConfirmacionRenovacion(
    toEmail:  string,
    nombre: string,
    planNombre: string,
    fechaInicio: Date,
    fechaFin: Date,
    monto: number,
  ): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`📧 Email deshabilitado: Confirmación renovación a ${toEmail}`);
      return;
    }

    try {
      await this.resend!.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: '✅ Membresía renovada exitosamente',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #10b981; color:  white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">✅ ¡Renovación Exitosa!</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top:  none;">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Tu membresía <strong>${planNombre}</strong> ha sido renovada exitosamente.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Plan:</strong> ${planNombre}</p>
                <p style="margin: 5px 0;"><strong>Fecha inicio:</strong> ${fechaInicio.toLocaleDateString('es-ES')}</p>
                <p style="margin: 5px 0;"><strong>Fecha fin: </strong> ${fechaFin. toLocaleDateString('es-ES')}</p>
                <p style="margin: 5px 0;"><strong>Monto pagado:</strong> $${monto.toFixed(2)}</p>
              </div>
              <p>¡Gracias por seguir confiando en nosotros!</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
            </div>
          </div>
        `,
      });

      this.logger.log(`✅ Email de confirmación de renovación enviado a ${toEmail}`);
    } catch (error) {
      this.logger. error(`❌ Error enviando confirmación de renovación a ${toEmail}:`, error);
    }
  }
}