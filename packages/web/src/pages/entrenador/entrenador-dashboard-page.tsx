import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import { 
  Users, 
  Activity,
  TrendingUp,
  Clock,
  Calendar,
  Target
} from 'lucide-react';

export function EntrenadorDashboardPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [totalClientes, setTotalClientes] = useState(0);
  const [asistenciasHoy, setAsistenciasHoy] = useState(0);
  const [asistenciasMes, setAsistenciasMes] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar clientes
      const clientesRes = await apiClient.clientes.findAll();
      setTotalClientes(clientesRes.clientes.length);

      // Cargar asistencias del día
      const today = new Date().toISOString().split('T')[0];
      const asistenciasHoyRes = await apiClient.asistencias.findAll(today, today);
      setAsistenciasHoy(asistenciasHoyRes.asistencias.length);

      // Cargar asistencias del mes
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const asistenciasMesRes = await apiClient.asistencias.findAll(firstDayOfMonth, today);
      setAsistenciasMes(asistenciasMesRes.asistencias.length);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gym SaaS - Entrenador</h1>
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
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard de Entrenador</h2>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bienvenido, {user?.nombre}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/clientes')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{totalClientes}</p>
                      <p className="text-xs text-gray-500 mt-1">Click para ver lista</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/asistencias')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{asistenciasHoy}</p>
                      <p className="text-xs text-gray-500 mt-1">Consultar historial</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/asistencias')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Asistencias del Mes</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{asistenciasMes}</p>
                      <p className="text-xs text-gray-500 mt-1">Total acumulado</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/clientes')}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Mis Clientes</h4>
                        <p className="text-sm text-gray-600 mt-1">Ver lista completa de clientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/asistencias')}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Ver Asistencias</h4>
                        <p className="text-sm text-gray-600 mt-1">Historial de asistencias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Seguimiento de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    Consulta el progreso y asistencias de tus clientes para brindar mejor seguimiento y optimizar sus entrenamientos.
                  </p>
                  <button
                    onClick={() => navigate('/clientes')}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Ver Clientes
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Información Importante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Asistencias</p>
                        <p className="text-sm text-gray-600">Consulta las asistencias para dar mejor seguimiento.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Progreso</p>
                        <p className="text-sm text-gray-600">Mantén registro del progreso de tus clientes.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}