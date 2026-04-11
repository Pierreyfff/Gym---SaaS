import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportExcelService {
  constructor(private readonly prisma: PrismaClient) {}

  async exportarClientes(gimnasioId: string): Promise<Buffer> {
    const clientes = await this.prisma. usuario.findMany({
      where: {
        gimnasioId,
        rol: 'cliente',
      },
      include: {
        perfilCliente: true,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    const workbook = new ExcelJS. Workbook();
    const worksheet = workbook.addWorksheet('Clientes');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Género', key: 'genero', width: 10 },
      { header: 'Fecha Nacimiento', key: 'fechaNacimiento', width: 15 },
      { header: 'Estado', key: 'estado', width: 10 },
      { header: 'Fecha Registro', key: 'fechaCreacion', width: 20 },
    ];

    // Estilo del encabezado
    worksheet. getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10b981' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    clientes.forEach((cliente) => {
      worksheet. addRow({
        id: cliente. id,
        nombre: cliente. nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono || 'N/A',
        genero:  cliente.perfilCliente?. genero || 'N/A',
        fechaNacimiento:  cliente.perfilCliente?.fechaNacimiento
          ? new Date(cliente.perfilCliente.fechaNacimiento).toLocaleDateString('es-ES')
          : 'N/A',
        estado: cliente.estado,
        fechaCreacion:  new Date(cliente.fechaCreacion).toLocaleDateString('es-ES'),
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportarPagos(gimnasioId: string, fechaInicio?:  Date, fechaFin?: Date): Promise<Buffer> {
    const where:  any = { gimnasioId };

    if (fechaInicio && fechaFin) {
      where.fechaPago = {
        gte:  fechaInicio,
        lte: fechaFin,
      };
    }

    const pagos = await this.prisma.pago.findMany({
      where,
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido:  true,
            email: true,
          },
        },
        membresia: {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pagos');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 40 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tipo', key: 'tipo', width:  15 },
      { header: 'Plan', key: 'plan', width: 20 },
      { header: 'Monto', key: 'monto', width: 15 },
      { header: 'Método Pago', key: 'metodoPago', width: 15 },
      { header: 'Fecha Pago', key: 'fechaPago', width: 20 },
      { header: 'Nota', key: 'nota', width: 40 },
    ];

    // Estilo del encabezado
    worksheet. getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3b82f6' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    let totalMonto = 0;
    pagos.forEach((pago) => {
      const monto = Number(pago.monto);
      totalMonto += monto;

      worksheet.addRow({
        id: pago.id,
        cliente: `${pago.cliente.nombre} ${pago.cliente.apellido}`,
        email: pago.cliente.email,
        tipo: pago.tipo,
        plan: pago.membresia?. plan. nombre || 'N/A',
        monto: monto. toFixed(2),
        metodoPago: pago.metodoPago,
        fechaPago:  new Date(pago.fechaPago).toLocaleDateString('es-ES'),
        nota: pago.nota || '',
      });
    });

    // Agregar fila de total
    const totalRow = worksheet.addRow({
      id: '',
      cliente: '',
      email: '',
      tipo: '',
      plan: 'TOTAL',
      monto: totalMonto.toFixed(2),
      metodoPago: '',
      fechaPago: '',
      nota: '',
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportarAsistencias(gimnasioId:  string, fechaInicio?: Date, fechaFin?: Date): Promise<Buffer> {
    const where: any = { gimnasioId };

    if (fechaInicio && fechaFin) {
      where.marcaTiempo = {
        gte:  fechaInicio,
        lte: fechaFin,
      };
    }

    const asistencias = await this.prisma.asistencia.findMany({
      where,
      include: {
        cliente: {
          select: {
            nombre:  true,
            apellido: true,
            email: true,
          },
        },
      },
      orderBy: {
        marcaTiempo: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width:  40 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Email', key:  'email', width: 30 },
      { header: 'Fecha y Hora', key: 'marcaTiempo', width: 25 },
    ];

    // Estilo del encabezado
    worksheet. getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF14b8a6' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    asistencias.forEach((asistencia) => {
      worksheet.addRow({
        id: asistencia.id,
        cliente: `${asistencia.cliente.nombre} ${asistencia.cliente.apellido}`,
        email: asistencia.cliente.email,
        marcaTiempo:  new Date(asistencia.marcaTiempo).toLocaleString('es-ES'),
      });
    });

    // Agregar fila de total
    const totalRow = worksheet.addRow({
      id: '',
      cliente:  '',
      email: `TOTAL ASISTENCIAS:  ${asistencias.length}`,
      marcaTiempo: '',
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}