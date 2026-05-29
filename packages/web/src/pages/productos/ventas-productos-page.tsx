import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ShoppingCart, DollarSign, TrendingUp, Package, Truck, Store } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { TableSkeleton, Skeleton } from '@/components/shared/skeleton-loader';

interface Venta {
  id: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  metodoPago: string;
  nota?: string;
  tipoEntrega?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  estadoEnvio?: string;
  fechaVenta: Date;
  producto: {
    id: string;
    nombre: string;
  };
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export function VentasProductosPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIngresos, setTotalIngresos] = useState(0);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.ventasProductos.findAll();
      setVentas(response.ventas as Venta[]);
      setTotalIngresos(response.totalIngresos);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las ventas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMetodoPagoLabel = (metodo: string) => {
    switch (metodo) {
      case 'efectivo':
        return 'Efectivo';
      case 'tarjeta':
        return 'Tarjeta';
      case 'transferencia':
        return 'Transferencia';
      default:
        return 'Otro';
    }
  };

  const getEstadoEnvioLabel = (estado?: string) => {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      preparando: 'Preparando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return labels[estado || ''] || '-';
  };

  const getEstadoEnvioColor = (estado?: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      preparando: 'bg-blue-100 text-blue-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[estado || ''] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateEstadoEnvio = async (ventaId: string, estadoEnvio: string) => {
    try {
      await apiClient.ventasProductos.updateEstadoEnvio(ventaId, estadoEnvio as any);
      toast({
        title: 'Estado actualizado',
        description: `Estado de envío cambiado a: ${getEstadoEnvioLabel(estadoEnvio)}`,
      });
      loadVentas();
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de envío',
        variant: 'destructive',
      });
    }
  };

  // Estadísticas
  const ventasHoy = ventas.filter(
    (v) => new Date(v.fechaVenta).toDateString() === new Date().toDateString(),
  );
  const ingresosHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const ventasSemana = ventas.filter((v) => new Date(v.fechaVenta) >= thisWeekStart);
  const ingresosSemana = ventasSemana.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Ventas de Productos</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6" />
                <p className="text-sm font-medium opacity-90">Ingresos Totales</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalIngresos)}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Ventas Totales</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{ventas.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Hoy</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(ingresosHoy)}</p>
              <p className="text-xs text-gray-500 mt-1">{ventasHoy.length} ventas</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">Esta Semana</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(ingresosSemana)}</p>
              <p className="text-xs text-gray-500 mt-1">{ventasSemana.length} ventas</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/ventas-productos/nueva')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Nueva Venta
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : ventas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No hay ventas registradas</p>
            <p className="text-sm text-gray-500">Comienza registrando tu primera venta</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{venta.producto.nombre}</div>
                      {venta.nota && <div className="text-sm text-gray-500">{venta.nota}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {venta.cliente
                          ? `${venta.cliente.nombre} ${venta.cliente.apellido}`
                          : 'Venta directa'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venta.cantidad}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-purple-600">{formatCurrency(venta.total)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {venta.tipoEntrega === 'domicilio' ? (
                          <Truck className="w-4 h-4 text-purple-600" />
                        ) : venta.tipoEntrega === 'retiro' ? (
                          <Store className="w-4 h-4 text-green-600" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600 ml-1">
                          {venta.tipoEntrega === 'domicilio' ? 'Domicilio' : venta.tipoEntrega === 'retiro' ? 'Retiro' : '-'}
                        </span>
                      </div>
                      {venta.tipoEntrega === 'domicilio' && venta.direccion && (
                        <div className="text-xs text-gray-400 mt-1">{venta.direccion}, {venta.ciudad}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {venta.tipoEntrega === 'domicilio' ? (
                        <select
                          value={venta.estadoEnvio || 'pendiente'}
                          onChange={(e) => handleUpdateEstadoEnvio(venta.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer ${getEstadoEnvioColor(venta.estadoEnvio)}`}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="preparando">Preparando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {getMetodoPagoLabel(venta.metodoPago)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(venta.fechaVenta)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}