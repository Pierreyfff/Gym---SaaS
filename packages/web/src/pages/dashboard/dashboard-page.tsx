import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import {
  Users,
  UserCheck,
  CreditCard,
  FileText,
  DollarSign,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Settings,
  Package,
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  UsersRound,
} from 'lucide-react';
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
import { EstadisticasGeneralesDto } from '@gym-saas/shared/src/dtos/estadisticas.dto';
import { CardSkeleton, ChartSkeleton } from '@/components/shared/skeleton-loader';

interface IngresosMensuales {
  mes: string;
  ingresos: number;
  cantidad: number;
}

interface PlanMasVendido {
  planId: string;
  planNombre: string;
  cantidad: number;
  ingresos: number;
}

interface AsistenciasPorMes {
  mes: string;
  cantidad: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const [stats, setStats] = useState<EstadisticasGeneralesDto | null>(null);
  const [ingresos, setIngresos] = useState<IngresosMensuales[]>([]);
  const [planes, setPlanes] = useState<PlanMasVendido[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciasPorMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroIngresos, setFiltroIngresos] = useState<
    'total' | 'membresias' | 'ventas'
  >('total');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, ingresosRes, planesRes, asistenciasRes] =
        await Promise.all([
          apiClient.estadisticas.getEstadisticasGenerales(),
          apiClient.estadisticas.getIngresosMensuales(),
          apiClient.estadisticas.getPlanesMasVendidos(),
          apiClient.estadisticas.getAsistenciasPorMes(),
        ]);

      setStats(statsRes as EstadisticasGeneralesDto);
      setIngresos(ingresosRes);
      setPlanes(planesRes);
      setAsistencias(asistenciasRes);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const membresiasPieData = stats
    ? [
        { name: 'Activas', value: stats.membresiasActivas, color: COLORS[0] },
        { name: 'Expiradas', value: stats.membresiasExpiradas, color: COLORS[1] },
        { name: 'Canceladas', value: stats.membresiasCanceladas, color: COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gym SaaS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.nombre} {user?.apellido}{' '}
              <span className="font-medium">({user?.rol})</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {loading ? (
          <div className="space-y-8">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>

            {/* Acceso Rápido Skeleton */}
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid - CLICKEABLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Ingresos - Clickeable */}
              <button
                onClick={() => navigate('/ingresos')}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white text-left hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium opacity-90">
                    Ingresos Totales
                  </h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 opacity-80" />
                    <ArrowRight className="w-4 h-4 opacity-60" />
                  </div>
                </div>

                {/* Selector de filtro */}
                <div className="flex gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setFiltroIngresos('total')}
                    className={`px-2 py-1 text-xs rounded transition ${
                      filtroIngresos === 'total'
                        ? 'bg-white text-green-600 font-semibold'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Total
                  </button>
                  <button
                    onClick={() => setFiltroIngresos('membresias')}
                    className={`px-2 py-1 text-xs rounded transition ${
                      filtroIngresos === 'membresias'
                        ? 'bg-white text-green-600 font-semibold'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Membresías
                  </button>
                  <button
                    onClick={() => setFiltroIngresos('ventas')}
                    className={`px-2 py-1 text-xs rounded transition ${
                      filtroIngresos === 'ventas'
                        ? 'bg-white text-green-600 font-semibold'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Ventas
                  </button>
                </div>

                {/* Monto principal */}
                <p className="text-3xl font-bold">
                  {filtroIngresos === 'total'
                    ? formatCurrency(stats?.totalIngresos ?? 0)
                    : filtroIngresos === 'membresias'
                      ? formatCurrency(stats?.ingresosMembresias ?? 0)
                      : formatCurrency(stats?.ingresosVentas ?? 0)}
                </p>

                {/* Este mes */}
                <p className="text-xs opacity-75 mt-2">
                  Este mes:{' '}
                  {filtroIngresos === 'total'
                    ? formatCurrency(stats?.ingresosMesActual ?? 0)
                    : filtroIngresos === 'membresias'
                      ? formatCurrency(stats?.ingresosMembresiaMesActual ?? 0)
                      : formatCurrency(stats?.ingresosVentasMesActual ?? 0)}
                </p>

                {/* Desglose cuando está en "Total" */}
                {filtroIngresos === 'total' && (
                  <div className="mt-3 pt-3 border-t border-green-400 border-opacity-30">
                    <div className="flex justify-between text-xs opacity-90">
                      <span>Membresías:</span>
                      <span className="font-semibold">
                        {formatCurrency(stats?.ingresosMembresias ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs opacity-90 mt-1">
                      <span>Ventas:</span>
                      <span className="font-semibold">
                        {formatCurrency(stats?.ingresosVentas ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs opacity-60 mt-3 text-right">Click para ver detalles →</p>
              </button>

              {/* Clientes - Clickeable */}
              <button
                onClick={() => navigate('/clientes')}
                className="bg-white rounded-lg shadow p-6 text-left hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Clientes
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalClientes || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.clientesActivos || 0} activos
                </p>
                <p className="text-xs text-gray-400 mt-3 text-right">Click para gestionar →</p>
              </button>

              {/* Membresías Activas - Clickeable */}
              <button
                onClick={() => navigate('/membresias')}
                className="bg-white rounded-lg shadow p-6 text-left hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Membresías Activas
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.membresiasActivas || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  De {stats?.totalMembresias || 0} totales
                </p>
                <p className="text-xs text-gray-400 mt-3 text-right">Click para ver todas →</p>
              </button>

              {/* Asistencias del Mes - Clickeable */}
              <button
                onClick={() => navigate('/asistencias')}
                className="bg-white rounded-lg shadow p-6 text-left hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-600">
                    Asistencias del Mes
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <ClipboardCheck className="w-5 h-5 text-teal-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.asistenciasMesActual || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date().toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-3 text-right">Click para registrar →</p>
              </button>
            </div>

            {/* Acceso Rápido */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Acceso Rápido
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <button
                  onClick={() => navigate('/usuarios')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Users className="w-5 h-5" />
                  <span>Usuarios</span>
                </button>

                <button
                  onClick={() => navigate('/clientes')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Clientes</span>
                </button>

                <button
                  onClick={() => navigate('/planes')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <FileText className="w-5 h-5" />
                  <span>Planes</span>
                </button>

                <button
                  onClick={() => navigate('/membresias')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Membresías</span>
                </button>

                <button
                  onClick={() => navigate('/pagos')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Pagos</span>
                </button>

                <button
                  onClick={() => navigate('/asistencias')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Asistencias</span>
                </button>

                <button
                  onClick={() => navigate('/productos')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Package className="w-5 h-5" />
                  <span>Productos</span>
                </button>

                <button
                  onClick={() => navigate('/ventas-productos')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Ventas</span>
                </button>

                <button
                  onClick={() => navigate('/ingresos')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Ingresos</span>
                </button>

                <button
                  onClick={() => navigate('/inscripciones/nueva')}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Inscripción</span>
                </button>

                <button
                  onClick={() => navigate('/configuracion')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </button>

                {/* 🆕 NUEVOS BOTONES */}
                <button
                  onClick={() => navigate('/staff')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <UsersRound className="w-5 h-5" />
                  <span>Staff</span>
                </button>

                <button
                  onClick={() => navigate('/testimonios')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Testimonios</span>
                </button>

                <button
                  onClick={() => navigate('/galeria')}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>Galería</span>
                </button>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Ingresos Mensuales */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ingresos Mensuales (Últimos 6 meses)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ingresos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) =>
                        typeof value === 'number' ? formatCurrency(value) : value
                      }
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Ingresos"
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Planes Más Vendidos */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 5 Planes Más Vendidos
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={planes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="planNombre" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend />
                    <Bar
                      dataKey="cantidad"
                      fill="#3b82f6"
                      name="Cantidad Vendida"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribución de Membresías */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribución de Membresías
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={membresiasPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {membresiasPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Asistencias por Mes */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Asistencias por Mes (Últimos 6 meses)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={asistencias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cantidad"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      name="Asistencias"
                      dot={{ fill: '#14b8a6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}