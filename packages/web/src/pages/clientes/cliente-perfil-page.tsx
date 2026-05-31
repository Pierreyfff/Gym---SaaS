import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Activity,
  DollarSign,
  Edit,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
// import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ClientePerfil {
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    fechaNacimiento?: Date;
    genero?: string;
    notas?: string;
    fechaCreacion: Date;
  };
  resumen: {
    totalPagado: number;
    totalAsistencias: number;
    membresiaActiva: {
      id: string;
      planNombre: string;
      fechaInicio: Date;
      fechaFin: Date;
      diasRestantes: number;
    } | null;
  };
  membresias: any[];
  pagos: any[];
  asistencias: any[];
  asistenciasMensuales: { mes: string; cantidad: number }[];
  ventasProductos: any[];
}

export function ClientePerfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
// const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [perfil, setPerfil] = useState<ClientePerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tabActiva, setTabActiva] = useState<'membresias' | 'pagos' | 'asistencias' | 'productos'>('membresias');

  useEffect(() => {
    if (id) {
      loadPerfil();
    }
  }, [id]);

  const loadPerfil = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await apiClient.clientes.getPerfilCompleto(id!);
      setPerfil(data);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError(true);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil del cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      activa: 'bg-green-100 text-green-800',
      expirada: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
      cancelada: 'bg-red-100 text-red-800',
      completado: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      reembolsado: 'bg-red-100 text-red-800',
      rechazado: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    };
    return badges[estado] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar el perfil del cliente</p>
          <button
            onClick={loadPerfil}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/clientes')}
            className="ml-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-semibold px-6 py-2 rounded-lg transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/clientes')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {perfil.cliente.nombre} {perfil.cliente.apellido}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cliente desde {formatDate(perfil.cliente.fechaCreacion)}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/clientes/${id}/editar`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Edit className="w-5 h-5" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información Personal */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{perfil.cliente.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{perfil.cliente.telefono || 'No registrado'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Nacimiento</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {perfil.cliente.fechaNacimiento ? formatDate(perfil.cliente.fechaNacimiento) : 'No registrada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Membresía Activa */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8" />
              {perfil.resumen.membresiaActiva && (
                <span className="px-3 py-1 bg-white dark:bg-gray-950 bg-opacity-20 rounded-full text-sm font-semibold">
                  {perfil.resumen.membresiaActiva.diasRestantes} días
                </span>
              )}
            </div>
            <p className="text-sm opacity-90 mb-1">Membresía Actual</p>
            <p className="text-2xl font-bold">
              {perfil.resumen.membresiaActiva ? perfil.resumen.membresiaActiva.planNombre : 'Sin membresía'}
            </p>
          </div>

          {/* Total Pagado */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Pagado</p>
            <p className="text-2xl font-bold">{formatCurrency(perfil.resumen.totalPagado)}</p>
          </div>

          {/* Total Asistencias */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Asistencias</p>
            <p className="text-2xl font-bold">{perfil.resumen.totalAsistencias}</p>
          </div>
        </div>

        {/* Gráfico de Asistencias */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Asistencias Mensuales</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={perfil.asistenciasMensuales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cantidad" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setTabActiva('membresias')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                  tabActiva === 'membresias'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Membresías ({perfil.membresias.length})
              </button>
              <button
                onClick={() => setTabActiva('pagos')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                  tabActiva === 'pagos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Pagos ({perfil.pagos.length})
              </button>
              <button
                onClick={() => setTabActiva('asistencias')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                  tabActiva === 'asistencias'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Asistencias ({perfil.asistencias.length})
              </button>
              <button
                onClick={() => setTabActiva('productos')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${
                  tabActiva === 'productos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Productos ({perfil.ventasProductos.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab Membresías */}
            {tabActiva === 'membresias' && (
              <div className="space-y-4">
                {perfil.membresias.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No hay membresías registradas</p>
                ) : (
                  perfil.membresias.map((membresia) => (
                    <div
                      key={membresia.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">{membresia.plan.nombre}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(membresia.estado)}`}>
                              {membresia.estado}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Inicio</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(membresia.fechaInicio)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Fin</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(membresia.fechaFin)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Precio</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(membresia.plan.precio)}</p>
                            </div>
                            {membresia.estado === 'activa' && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Días restantes</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{membresia.diasRestantes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Pagos */}
            {tabActiva === 'pagos' && (
              <div className="space-y-4">
                {perfil.pagos.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No hay pagos registrados</p>
                ) : (
                  perfil.pagos.map((pago) => (
                    <div
                      key={pago.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-blue-600 text-lg">{formatCurrency(pago.monto)}</h3>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(pago.estado)}`}>
                              {pago.estado}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Método</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{pago.metodoPago}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Fecha</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(pago.fechaPago)}</p>
                            </div>
                            {pago.membresia && (
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Plan</p>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">{pago.membresia.planNombre}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Asistencias */}
            {tabActiva === 'asistencias' && (
              <div className="space-y-2">
                {perfil.asistencias.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No hay asistencias registradas</p>
                ) : (
                  perfil.asistencias.slice(0, 20).map((asistencia) => (
                    <div
                      key={asistencia.id}
                      className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(asistencia.fechaHora)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(asistencia.fechaHora).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab Productos */}
            {tabActiva === 'productos' && (
              <div className="space-y-4">
                {perfil.ventasProductos.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">No hay compras de productos registradas</p>
                ) : (
                  perfil.ventasProductos.map((venta) => (
                    <div
                      key={venta.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{venta.productoNombre}</h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Cantidad</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{venta.cantidad}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Precio Unit.</p>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(venta.precioUnitario)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Total</p>
                              <p className="font-semibold text-blue-600">{formatCurrency(venta.total)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{formatDate(venta.fechaVenta)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}