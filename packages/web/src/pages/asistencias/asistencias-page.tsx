import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  UserCheck,
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils/download-file';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/shared/skeleton-loader';

interface Asistencia {
  id: string;
  gimnasioId: string;
  marcaTiempo: Date;
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  fechaCreacion?: Date;
}

interface ClienteElegible {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  plan: {
    id: string;
    nombre: string;
  };
}

export function AsistenciasPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [clientesElegibles, setClientesElegibles] = useState<ClienteElegible[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filterDate, setFilterDate] = useState('');
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadAsistencias(), loadClientesElegibles()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAsistencias = async () => {
    const response = await apiClient.asistencias.findAll();
    setAsistencias(response.asistencias);
  };

  const loadClientesElegibles = async () => {
    setLoadingClientes(true);
    try {
      const response = await apiClient.asistencias.findClientesElegibles();
      setClientesElegibles(response.clientes);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleCheckIn = async (clienteId: string, clienteNombre: string) => {
    try {
      setRegistering(clienteId);

      await apiClient.asistencias.create({
        clienteId,
        marcaTiempo: new Date().toISOString(),
      });

      toast({
        title: 'Check-in exitoso',
        description: `${clienteNombre} registrado correctamente`,
      });

      await loadData();
    } catch (error: any) {
      console.error('Error registrando asistencia:', error);
      const message = error.response?.data?.message || 'Error al registrar check-in';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setRegistering(null);
    }
  };

  const filteredClientes = clientesElegibles.filter((cliente) => {
    const matchSearch = `${cliente.nombre} ${cliente.apellido} ${cliente.email}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    return matchSearch;
  });

  const filteredAsistencias = asistencias.filter((asistencia) => {
    const matchDate = filterDate
      ? new Date(asistencia.marcaTiempo).toISOString().split('T')[0] === filterDate
      : true;
    return matchDate;
  });

  // Estadísticas
  const today = new Date().toISOString().split('T')[0];
  const asistenciasHoy = asistencias.filter(
    (a) => new Date(a.marcaTiempo).toISOString().split('T')[0] === today,
  ).length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);
  const asistenciasSemana = asistencias.filter(
    (a) => new Date(a.marcaTiempo) >= thisWeekStart,
  ).length;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const asistenciasMes = asistencias.filter(
    (a) => new Date(a.marcaTiempo) >= thisMonthStart,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check-in de Asistencias</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de exportar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={async () => {
              try {
                await downloadFile(
                  `${import.meta.env.VITE_API_URL}/export/asistencias/excel`,
                  `asistencias_${Date.now()}.xlsx`,
                );
                toast({
                  title: 'Descarga exitosa',
                  description: 'El archivo ha sido descargado',
                });
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'No se pudo descargar el archivo',
                  variant: 'destructive',
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Excel</span>
          </button>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</h3>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{asistencias.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Hoy</h3>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">{asistenciasHoy}</p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Esta Semana</h3>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">{asistenciasSemana}</p>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Este Mes</h3>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600">{asistenciasMes}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-in rápido */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Check-in Rápido</h2>
                <button
                  onClick={loadClientesElegibles}
                  disabled={loadingClientes}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Actualizar lista"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loadingClientes ? 'animate-spin' : ''}`}
                  />
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900">Solo clientes elegibles</p>
                  <p className="text-xs text-green-700 mt-1">
                    Se muestran únicamente clientes con membresía activa que no han marcado entrada
                    hoy
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
              {loading || loadingClientes ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredClientes.length === 0 ? (
                <div className="p-8 text-center">
                  {clientesElegibles.length === 0 ? (
                    <>
                      <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No hay clientes elegibles</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Todos los clientes ya marcaron entrada hoy o no tienen membresía activa
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">No se encontraron resultados</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Intenta con otro término de búsqueda</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredClientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {cliente.nombre} {cliente.apellido}
                          </p>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3" />
                            <span>Elegible</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cliente.plan.nombre}</p>
                      </div>

                      <button
                        onClick={() =>
                          handleCheckIn(cliente.id, `${cliente.nombre} ${cliente.apellido}`)
                        }
                        disabled={registering === cliente.id}
                        className="ml-4 px-6 py-2 rounded-lg font-semibold transition bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        {registering === cliente.id ? 'Registrando...' : 'Check-in'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial de hoy */}
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Historial de Asistencias
              </h2>
              <input
                type="date"
                value={filterDate || today}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-5 w-16 mb-1" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAsistencias.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No hay asistencias{filterDate ? ' en esta fecha' : ' hoy'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAsistencias.map((asistencia) => (
                    <div key={asistencia.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {asistencia.cliente.nombre} {asistencia.cliente.apellido}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asistencia.cliente.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            {new Date(asistencia.marcaTiempo).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(asistencia.marcaTiempo).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}