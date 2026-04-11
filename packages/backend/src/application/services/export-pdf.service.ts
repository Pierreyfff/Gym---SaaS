import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportPdfService {
  constructor(private readonly prisma: PrismaClient) {}

  async exportarPagos(gimnasioId:  string, fechaInicio?: Date, fechaFin?: Date): Promise<Buffer> {
    const where: any = { gimnasioId };

    if (fechaInicio && fechaFin) {
      where.fechaPago = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }

    const pagos = await this.prisma. pago.findMany({
      where,
      include: {
        cliente: {
          select:  {
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        membresia:  {
          include: {
            plan: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaPago: 'desc',
      },
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Encabezado
      doc.fontSize(20).text('Reporte de Pagos', { align: 'center' });
      doc.moveDown();

      if (fechaInicio && fechaFin) {
        doc
          .fontSize(12)
          .text(
            `Período: ${fechaInicio.toLocaleDateString('es-ES')} - ${fechaFin.toLocaleDateString('es-ES')}`,
            { align: 'center' }
          );
        doc.moveDown();
      }

      doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
      doc.moveDown(2);

      // Tabla
      let totalMonto = 0;
      let y = doc.y;

      // Encabezados de tabla
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Cliente', 50, y, { width: 150, continued: false });
      doc.text('Plan', 210, y, { width: 100, continued: false });
      doc.text('Monto', 320, y, { width: 80, continued: false });
      doc.text('Método', 410, y, { width: 80, continued: false });
      doc.text('Fecha', 500, y, { width: 80, continued: false });

      y += 20;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      // Datos
      doc.font('Helvetica');
      pagos.forEach((pago) => {
        const monto = Number(pago.monto);
        totalMonto += monto;

        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc. fontSize(9);
        doc.text(`${pago.cliente. nombre} ${pago.cliente. apellido}`, 50, y, { width: 150 });
        doc.text(pago.membresia?.plan.nombre || 'N/A', 210, y, { width: 100 });
        doc.text(`$${monto.toFixed(2)}`, 320, y, { width: 80 });
        doc.text(pago.metodoPago, 410, y, { width: 80 });
        doc.text(new Date(pago.fechaPago).toLocaleDateString('es-ES'), 500, y, { width: 80 });

        y += 25;
      });

      // Total
      y += 10;
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 15;
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('TOTAL:', 210, y);
      doc.text(`$${totalMonto.toFixed(2)}`, 320, y);

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'Generado por Gym SaaS',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    });
  }
}