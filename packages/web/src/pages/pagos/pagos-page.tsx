import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Search,
  DollarSign,
  TrendingUp,
  Download,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';
import { downloadFile } from '@/lib/utils/download-file';
import { ReembolsarPagoPanel } from './reembolsar-pago-panel';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';

interface Pago {
  id: string;
  gimnasioId: string;
  monto: number;
  metodoPago: string;
  estado: string;
  referencia?: string;
  notas?: string;
  motivoReembolso?: string;
  fechaReembolso?: Date;
  membresia: {
    id: string;
    fechaInicio: Date;
    fechaFin: Date;
    cliente: {
      id: string;
      nombre: string;
      apellido: string;
      email: string;
    };
    plan: {
      id: string;
      nombre: string;
      precio: number;
    };
  };
  fechaCreacion?: Date;
}

export function PagosPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const [reembolsarModal, setReembolsarModal] = useState<{
    isOpen: boolean;
    pagoId: string | null;
    monto: number;
    clienteNombre: string;
  }>({
    isOpen: false,
    pagoId: null,
    monto: 0,
    clienteNombre: '',
  });

  useEffect(() => {
    loadPagos();
  }, []);

  const loadPagos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.pagos.findAll();
      setPagos(response.pagos as Pago[]);
    } catch (error) {
      console.error('Error cargando pagos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pagos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReembolsarClick = (pago: Pago) => {
    setReembolsarModal({
      isOpen: true,
      pagoId: pago.id,
      monto: pago.monto,
      clienteNombre: `${pago.membresia.cliente.nombre} ${pago.membresia.cliente.apellido}`,
    });
  };

  const handleReembolsarClose = () => {
    setReembolsarModal({
      isOpen: false,
      pagoId: null,
      monto: 0,
      clienteNombre: '',
    });
  };

  const handleReembolsarSuccess = () => {
    loadPagos();
  };

  const totalIngresos = pagos
    .filter((p) => p.estado === 'completado')
    .reduce((sum, p) => sum + p.monto, 0);

  const estadoStats = {
    todos: pagos.length,
    completado: pagos.filter((p) => p.estado === 'completado').length,
    pendiente: pagos.filter((p) => p.estado === 'pendiente').length,
    reembolsado: pagos.filter((p) => p.estado === 'reembolsado').length,
    rechazado: pagos.filter((p) => p.estado === 'rechazado').length,
  };

  const filteredPagos = pagos.filter((pago) => {
    const matchSearch = `${pago.membresia.cliente.nombre} ${pago.membresia.cliente.apellido} ${pago.membresia.plan.nombre}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchEstado = filterEstado === 'todos' || pago.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'reembolsado':
        return 'bg-red-100 text-red-800';
      case 'rechazado':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Pagos</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg md:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6" />
              <p className="text-sm font-medium opacity-90">Ingresos Totales</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalIngresos)}</p>
          </div>

          <button
            onClick={() => setFilterEstado('todos')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'todos'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Todos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{estadoStats.todos}</p>
          </button>

          <button
            onClick={() => setFilterEstado('completado')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'completado'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
            <p className="text-2xl font-bold text-green-600">{estadoStats.completado}</p>
          </button>

          <button
            onClick={() => setFilterEstado('pendiente')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'pendiente'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{estadoStats.pendiente}</p>
          </button>

          <button
            onClick={() => setFilterEstado('reembolsado')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'reembolsado'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Reembolsados</p>
            <p className="text-2xl font-bold text-red-600">{estadoStats.reembolsado}</p>
          </button>

          <button
            onClick={() => setFilterEstado('rechazado')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'rechazado'
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">Rechazados</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{estadoStats.rechazado}</p>
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente o plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  await downloadFile(
                    `${import.meta.env.VITE_API_URL}/export/pagos/excel`,
                    `pagos_${Date.now()}.xlsx`,
                  );
                  toast({
                    title: 'Descarga exitosa',
                    description: 'El archivo ha sido descargado',
                  });
                } catch {
                  toast({
                    title: 'Error',
                    description: 'No se pudo descargar el archivo',
                    variant: 'destructive',
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              <span>Excel</span>
            </button>

            <button
              onClick={async () => {
                try {
                  await downloadFile(
                    `${import.meta.env.VITE_API_URL}/export/pagos/pdf`,
                    `pagos_${Date.now()}.pdf`,
                  );
                  toast({
                    title: 'Descarga exitosa',
                    description: 'El archivo ha sido descargado',
                  });
                } catch {
                  toast({
                    title: 'Error',
                    description: 'No se pudo descargar el archivo',
                    variant: 'destructive',
                  });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              <FileText className="w-5 h-5" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => navigate('/inscripciones/nueva')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Inscripción</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : filteredPagos.length === 0 ? (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No se encontraron pagos</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filterEstado !== 'todos'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza registrando tu primer pago'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {pago.membresia.cliente.nombre} {pago.membresia.cliente.apellido}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{pago.membresia.cliente.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{pago.membresia.plan.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                      {formatCurrency(pago.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMetodoPagoLabel(pago.metodoPago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pago.fechaCreacion && formatDate(pago.fechaCreacion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getEstadoBadgeColor(
                          pago.estado,
                        )}`}
                      >
                        {pago.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {currentUser?.rol === 'admin' && pago.estado === 'completado' && (
                        <button
                          onClick={() => handleReembolsarClick(pago)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Reembolsar"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de Reembolsar */}
      {reembolsarModal.isOpen && reembolsarModal.pagoId && (
        <ReembolsarPagoPanel
          pagoId={reembolsarModal.pagoId}
          monto={reembolsarModal.monto}
          clienteNombre={reembolsarModal.clienteNombre}
          onClose={handleReembolsarClose}
          onSuccess={handleReembolsarSuccess}
        />
      )}
    </div>
  );
}