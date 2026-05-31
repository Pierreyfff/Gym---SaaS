import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { 
  Users, 
  CreditCard, 
  UserCheck, 
  ShoppingBag,
  TrendingUp,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { useThemeStore } from '@/lib/stores/theme-store';

export function RecepcionistaDashboardPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asistenciasHoy, setAsistenciasHoy] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await apiClient.estadisticas.getEstadisticasGenerales();
      setStats(statsData);
      
      // Cargar asistencias de hoy
      try {
        const today = new Date().toISOString().split('T')[0];
        const asistenciasData = await apiClient.asistencias.findAll(today, today);
        setAsistenciasHoy(asistenciasData.asistencias?.length || 0);
      } catch (err) {
        console.log('No se pudieron cargar asistencias del día');
        setAsistenciasHoy(0);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Nueva Inscripción',
      description: 'Registrar nuevo cliente',
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/inscripciones/nueva'),
    },
    {
      title: 'Ver Asistencias',
      description: 'Gestionar asistencias',
      icon: UserCheck,
      color: 'bg-green-500',
      onClick: () => navigate('/asistencias'),
    },
    {
      title: 'Registrar Pago',
      description: 'Procesar pago de cliente',
      icon: CreditCard,
      color: 'bg-purple-500',
      onClick: () => navigate('/pagos'),
    },
    {
      title: 'Nueva Venta',
      description: 'Vender producto',
      icon: ShoppingBag,
      color: 'bg-orange-500',
      onClick: () => navigate('/ventas-productos/nueva'),
    },
  ];

  const statCards = [
    {
      title: 'Clientes Activos',
      value: stats?.clientesActivos || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      onClick: () => navigate('/clientes'),
    },
    {
      title: 'Membresías Activas',
      value: stats?.membresiasActivas || 0,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      onClick: () => navigate('/membresias'),
    },
    {
      title: 'Asistencias Hoy',
      value: asistenciasHoy,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      onClick: () => navigate('/asistencias'),
    },
    {
      title: 'Ingresos del Mes',
      value: `$${stats?.ingresosMesActual?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gym SaaS - Recepción</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard de Recepción</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Stats Cards - CLICKEABLES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={stat.onClick}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={action.onClick}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center`}>
                          <action.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-gray-100">{action.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Accesos Directos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/clientes')}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Ver Clientes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar clientes del gimnasio</p>
                    </button>
                    <button
                      onClick={() => navigate('/membresias')}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Ver Membresías</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar membresías activas</p>
                    </button>
                    <button
                      onClick={() => navigate('/productos')}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Ver Productos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gestionar inventario</p>
                    </button>
                    <button
                      onClick={() => navigate('/ventas-productos')}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Ver Ventas</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Historial de ventas de productos</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Resumen del Mes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Asistencias del Mes</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{stats?.asistenciasMesActual || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Membresías Activas</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{stats?.membresiasActivas || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Clientes Activos</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{stats?.clientesActivos || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos del Mes</span>
                      <span className="font-bold text-green-600">${stats?.ingresosMesActual?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alert de tareas pendientes */}
            {stats?.membresiasExpiradas > 0 && (
              <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 dark:text-orange-100">Atención Requerida</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Hay {stats.membresiasExpiradas} membresías expiradas que requieren renovación.
                      </p>
                      <button
                        onClick={() => navigate('/membresias')}
                        className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition"
                      >
                        Ver Membresías →
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}