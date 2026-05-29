import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@gym-saas/database';
import { IVentaProductoRepository } from '@domain/repositories/venta-producto.repository.interface';
import {
  CreateVentaProductoDto,
  VentaProductoResponseDto,
  VentaProductoListResponseDto,
  UpdateEstadoEnvioDto,
} from '@gym-saas/shared';

@Injectable()
export class VentaProductoRepository implements IVentaProductoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    gimnasioId: string,
    userId: string,
    dto: CreateVentaProductoDto,
  ): Promise<VentaProductoResponseDto[]> {
    const ventas: VentaProductoResponseDto[] = [];

    // Procesar cada item en una transacción
    for (const item of dto.items) {
      const producto = await this.prisma.producto.findFirst({
        where: { id: item.productoId, gimnasioId },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto ${item.productoId} no encontrado`,
        );
      }

      if (producto.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        );
      }

      const total = Number(producto.precio) * item.cantidad;

      // Crear venta
      const venta = await this.prisma.ventaProducto.create({
        data: {
          gimnasioId,
          productoId: item.productoId,
          clienteId: dto.clienteId,
          cantidad: item.cantidad,
          precioUnitario: producto.precio,
          total,
          metodoPago: dto.metodoPago as any,
          nota: dto.nota,
          tipoEntrega: dto.tipoEntrega as any,
          direccion: dto.direccion,
          ciudad: dto.ciudad,
          codigoPostal: dto.codigoPostal,
          telefono: dto.telefono,
          estadoEnvio: dto.tipoEntrega === 'domicilio' ? 'pendiente' : (undefined as any),
        },
        include: {
          producto: true,
          cliente: true,
        },
      });

      // Reducir stock
      await this.prisma.producto.update({
        where: { id: item.productoId },
        data: {
          stock: {
            decrement: item.cantidad,
          },
        },
      });

      // Registrar movimiento de inventario
      // Solo crear movimiento si userId existe
      if (userId) {
        await this.prisma.movimientoInventario.create({
          data: {
            gimnasioId,
            productoId: item.productoId,
            tipo: 'salida',
            cantidad: -item.cantidad,
            stockAnterior: producto.stock,
            stockNuevo: producto.stock - item.cantidad,
            motivo: 'Venta',
            referencia: venta.id,
            creadoPorId: userId,
          },
        });
      }

      ventas.push(this.mapToResponse(venta));
    }

    return ventas;
  }

  async findAll(gimnasioId: string, clienteId?: string): Promise<VentaProductoListResponseDto> {
    const ventas = await this.prisma.ventaProducto.findMany({
      where: {
        gimnasioId,
        ...(clienteId ? { clienteId } : {}),
      },
      include: {
        producto: true,
        cliente: true,
      },
      orderBy: { fechaVenta: 'desc' },
    });

    const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.total), 0);

    return {
      ventas: ventas.map(this.mapToResponse),
      total: ventas.length,
      totalIngresos,
    };
  }

  async findById(
    id: string,
    gimnasioId: string,
  ): Promise<VentaProductoResponseDto | null> {
    const venta = await this.prisma.ventaProducto.findFirst({
      where: { id, gimnasioId },
      include: {
        producto: true,
        cliente: true,
      },
    });

    if (!venta) return null;

    return this.mapToResponse(venta);
  }

  async updateEstadoEnvio(
    id: string,
    gimnasioId: string,
    dto: UpdateEstadoEnvioDto,
  ): Promise<VentaProductoResponseDto> {
    const venta = await this.prisma.ventaProducto.findFirst({
      where: { id, gimnasioId },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    const updated = await this.prisma.ventaProducto.update({
      where: { id },
      data: {
        estadoEnvio: dto.estadoEnvio as any,
      },
      include: {
        producto: true,
        cliente: true,
      },
    });

    return this.mapToResponse(updated);
  }

  async findByDateRange(
    gimnasioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<VentaProductoListResponseDto> {
    const ventas = await this.prisma.ventaProducto.findMany({
      where: {
        gimnasioId,
        fechaVenta: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      include: {
        producto: true,
        cliente: true,
      },
      orderBy: { fechaVenta: 'desc' },
    });

    const totalIngresos = ventas.reduce((sum, v) => sum + Number(v.total), 0);

    return {
      ventas: ventas.map(this.mapToResponse),
      total: ventas.length,
      totalIngresos,
    };
  }

  private mapToResponse(venta: any): VentaProductoResponseDto {
    return {
      id: venta.id,
      gimnasioId: venta.gimnasioId,
      cantidad: venta.cantidad,
      precioUnitario: Number(venta.precioUnitario),
      total: Number(venta.total),
      metodoPago: venta.metodoPago,
      nota: venta.nota || undefined,
      tipoEntrega: venta.tipoEntrega || undefined,
      direccion: venta.direccion || undefined,
      ciudad: venta.ciudad || undefined,
      codigoPostal: venta.codigoPostal || undefined,
      telefono: venta.telefono || undefined,
      estadoEnvio: venta.estadoEnvio || undefined,
      fechaVenta: venta.fechaVenta,
      producto: {
        id: venta.producto.id,
        nombre: venta.producto.nombre,
      },
      cliente: venta.cliente
        ? {
            id: venta.cliente.id,
            nombre: venta.cliente.nombre,
            apellido: venta.cliente.apellido,
          }
        : undefined,
      fechaCreacion: venta.fechaCreacion,
    };
  }
}
