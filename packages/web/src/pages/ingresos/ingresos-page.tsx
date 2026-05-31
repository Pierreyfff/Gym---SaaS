import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Filter,
  RefreshCw,
  Download,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Filtros {
  fechaInicio: string;
  fechaFin: string;
  tipo: 'todos' | 'membresia' | 'producto';
  metodoPago: string;
}

export function IngresosPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>({
    fechaInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipo: 'todos',
    metodoPago: '',
  });

  const [resumen, setResumen] = useState<any>(null);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<any[]>([]);
  const [ingresosDiarios, setIngresosDiarios] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [ingresosRes, productosRes, diariosRes] = await Promise.all([
        apiClient.reportes.getIngresosDetallados({
          fechaInicio: filtros.fechaInicio,
          fechaFin: filtros.fechaFin,
          tipo: filtros.tipo,
          metodoPago: filtros.metodoPago || undefined,
        }),
        apiClient.reportes.getProductosMasVendidos(
          5,
          filtros.fechaInicio,
          filtros.fechaFin,
        ),
        apiClient.reportes.getIngresosDiarios(30),
      ]);

      setResumen(ingresosRes.resumen);
      setIngresos(ingresosRes.ingresos);
      setProductosMasVendidos(productosRes);
      setIngresosDiarios(diariosRes);
    } catch (error) {
      console.error('Error cargando reportes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los reportes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Preparar datos para gráfico de métodos de pago
  const metodosPagoData = resumen
    ? Object.entries(resumen.ingresosPorMetodo).map(([metodo, monto]) => ({
        name: metodo.charAt(0).toUpperCase() + metodo.slice(1),
        value: monto as number,
      }))
    : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Reportes de Ingresos
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaInicio: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) =>
                  setFiltros({ ...filtros, fechaFin: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    tipo: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="membresia">Membresías</option>
                <option value="producto">Productos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Pago
              </label>
              <select
                value={filtros.metodoPago}
                onChange={(e) =>
                  setFiltros({ ...filtros, metodoPago: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFiltrar}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
                <span>Filtrar</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando reportes...</p>
          </div>
        ) : (
          <>
            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium opacity-90">
                    Total Ingresos
                  </h3>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">
                  {formatCurrency(resumen?.totalIngresos ?? 0)}
                </p>
                <p className="text-xs opacity-75 mt-2">
                  {resumen?.cantidadTransacciones ?? 0} transacciones
                </p>
              </div>

              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Membresías
                  </h3>
                  <CreditCard className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(resumen?.totalMembresias ?? 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Productos
                  </h3>
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(resumen?.totalProductos ?? 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Promedio
                  </h3>
                  <DollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(resumen?.promedioTransaccion ?? 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">por transacción</p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Ingresos Diarios */}
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Ingresos Diarios (Últimos 30 días)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ingresosDiarios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tickFormatter={formatDateShort}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(label) => formatDateShort(label)}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="membresias"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Membresías"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="productos"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Productos"
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Total"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Métodos de Pago */}
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Ingresos por Método de Pago
                </h3>
                {metodosPagoData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metodosPagoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) =>
                          `${entry.name}: ${formatCurrency(entry.value)}`
                        }
                        outerRadius={100}
                        dataKey="value"
                      >
                        {metodosPagoData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No hay datos
                  </div>
                )}
              </div>

              {/* Top Productos */}
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Top 5 Productos Más Vendidos
                </h3>
                {productosMasVendidos.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productosMasVendidos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          if (name === 'ingresosTotales') {
                            return formatCurrency(value);
                          }
                          return value;
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="cantidadVendida"
                        fill="#3b82f6"
                        name="Cantidad"
                      />
                      <Bar
                        dataKey="ingresosTotales"
                        fill="#10b981"
                        name="Ingresos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                    No hay datos
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Detalle de Transacciones ({ingresos.length})
                </h3>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
                  onClick={() => {
                    toast({
                      title: 'Próximamente',
                      description: 'La exportación estará disponible pronto',
                    });
                  }}
                >
                  <Download className="w-5 h-5" />
                  <span>Exportar</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Método
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {ingresos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                        >
                          No hay transacciones en el periodo seleccionado
                        </td>
                      </tr>
                    ) : (
                      ingresos.map((ingreso) => (
                        <tr key={ingreso.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(ingreso.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                ingreso.tipo === 'membresia'
                                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                  : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {ingreso.tipo === 'membresia'
                                ? 'Membresía'
                                : 'Producto'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                            {ingreso.descripcion}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {ingreso.cliente.nombre} {ingreso.cliente.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {ingreso.metodoPago}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                            {formatCurrency(ingreso.monto)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
