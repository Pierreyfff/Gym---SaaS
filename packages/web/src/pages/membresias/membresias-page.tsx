import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  XCircle,
  ArrowLeft,
  Search,
  CreditCard,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Repeat,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { CambiarPlanPanel } from './cambiar-plan-panel';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';

interface Membresia {
  id: string;
  gimnasioId: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'activa' | 'expirada' | 'cancelada';
  diasRestantes?: number;
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
    duracionDias: number;
  };
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export function MembresiasPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [filterEstado, setFilterEstado] = useState<string>('todas');

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    membresiaId: string | null;
    clienteNombre: string;
  }>({
    isOpen: false,
    membresiaId: null,
    clienteNombre: '',
  });
  const [deleting, setDeleting] = useState(false);

  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    membresiaId: string | null;
    clienteNombre: string;
  }>({
    isOpen: false,
    membresiaId: null,
    clienteNombre: '',
  });
  const [canceling, setCanceling] = useState(false);

  const [cambiarPlanModal, setCambiarPlanModal] = useState<{
    isOpen: boolean;
    membresiaId: string | null;
    planActual: {
      id: string;
      nombre: string;
      precio: number;
      duracionDias: number;
    } | null;
  }>({
    isOpen: false,
    membresiaId: null,
    planActual: null,
  });

  useEffect(() => {
    loadMembresias();
  }, []);

  const loadMembresias = async () => {
    try {
      setLoading(true);
      const response = await apiClient.membresias.findAll();
      setMembresias(response.membresias);
    } catch (error) {
      console.error('Error cargando membresías:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las membresías',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (membresia: Membresia) => {
    setDeleteModal({
      isOpen: true,
      membresiaId: membresia.id,
      clienteNombre: `${membresia.cliente.nombre} ${membresia.cliente.apellido}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.membresiaId) return;

    try {
      setDeleting(true);
      await apiClient.membresias.delete(deleteModal.membresiaId);

      toast({
        title: 'Membresía eliminada',
        description: 'La membresía ha sido eliminada correctamente',
      });

      await loadMembresias();
      setDeleteModal({ isOpen: false, membresiaId: null, clienteNombre: '' });
    } catch (error) {
      console.error('Error eliminando membresía:', error);

      toast({
        title: 'Error',
        description: 'No se pudo eliminar la membresía',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, membresiaId: null, clienteNombre: '' });
  };

  const handleCancelarClick = (membresia: Membresia) => {
    setCancelModal({
      isOpen: true,
      membresiaId: membresia.id,
      clienteNombre: `${membresia.cliente.nombre} ${membresia.cliente.apellido}`,
    });
  };

  const handleCancelarConfirm = async () => {
    if (!cancelModal.membresiaId) return;

    try {
      setCanceling(true);
      await apiClient.membresias.cancelar(cancelModal.membresiaId);

      toast({
        title: 'Membresía cancelada',
        description: 'La membresía ha sido cancelada correctamente',
      });

      await loadMembresias();
      setCancelModal({ isOpen: false, membresiaId: null, clienteNombre: '' });
    } catch (error) {
      console.error('Error cancelando membresía:', error);

      toast({
        title: 'Error',
        description: 'No se pudo cancelar la membresía',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleCancelarCancel = () => {
    setCancelModal({ isOpen: false, membresiaId: null, clienteNombre: '' });
  };

  const handleCambiarPlanClick = (membresia: Membresia) => {
    setCambiarPlanModal({
      isOpen: true,
      membresiaId: membresia.id,
      planActual: {
        id: membresia.plan.id,
        nombre: membresia.plan.nombre,
        precio: membresia.plan.precio,
        duracionDias: membresia.plan.duracionDias,
      },
    });
  };

  const handleCambiarPlanClose = () => {
    setCambiarPlanModal({
      isOpen: false,
      membresiaId: null,
      planActual: null,
    });
  };

  const handleCambiarPlanSuccess = () => {
    loadMembresias();
  };

  const filteredMembresias = membresias.filter((membresia) => {
    const matchSearch = `${membresia.cliente.nombre} ${membresia.cliente.apellido} ${membresia.plan.nombre}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchEstado = filterEstado === 'todas' || membresia.estado === filterEstado;

    return matchSearch && matchEstado;
  });

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'expirada':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const estadoStats = {
    todas: membresias.length,
    activa: membresias.filter((m) => m.estado === 'activa').length,
    expirada: membresias.filter((m) => m.estado === 'expirada').length,
    cancelada: membresias.filter((m) => m.estado === 'cancelada').length,
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Membresías</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setFilterEstado('todas')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'todas'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">Todas</p>
            <p className="text-2xl font-bold text-gray-900">{estadoStats.todas}</p>
          </button>
          <button
            onClick={() => setFilterEstado('activa')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'activa'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">Activas</p>
            <p className="text-2xl font-bold text-green-600">{estadoStats.activa}</p>
          </button>
          <button
            onClick={() => setFilterEstado('expirada')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'expirada'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">Expiradas</p>
            <p className="text-2xl font-bold text-red-600">{estadoStats.expirada}</p>
          </button>
          <button
            onClick={() => setFilterEstado('cancelada')}
            className={`p-4 rounded-lg border-2 transition ${
              filterEstado === 'cancelada'
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600">Canceladas</p>
            <p className="text-2xl font-bold text-gray-600">{estadoStats.cancelada}</p>
          </button>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente o plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => navigate('/inscripciones/nueva')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Inscripción</span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : filteredMembresias.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No se encontraron membresías</p>
            <p className="text-sm text-gray-500">
              {searchTerm || filterEstado !== 'todas'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza agregando tu primera membresía'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembresias.map((membresia) => (
                  <tr key={membresia.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {membresia.cliente.nombre} {membresia.cliente.apellido}
                          </span>
                          {membresia.estado === 'activa' &&
                            membresia.diasRestantes !== undefined &&
                            membresia.diasRestantes <= 3 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3" />
                                Vence pronto
                              </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">{membresia.cliente.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {membresia.plan.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPrice(membresia.plan.precio)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(membresia.fechaInicio)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(membresia.fechaFin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {membresia.estado === 'activa' ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              membresia.diasRestantes !== undefined &&
                              membresia.diasRestantes <= 3
                                ? 'text-red-600'
                                : membresia.diasRestantes !== undefined &&
                                    membresia.diasRestantes <= 7
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                            }`}
                          >
                            {membresia.diasRestantes} días
                          </span>
                          {membresia.diasRestantes !== undefined &&
                            membresia.diasRestantes <= 7 && (
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  membresia.diasRestantes <= 3
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {membresia.diasRestantes <= 3
                                  ? '¡Urgente!'
                                  : 'Próximo a vencer'}
                              </span>
                            )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(
                          membresia.estado,
                        )}`}
                      >
                        {membresia.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/membresias/${membresia.id}/editar`)}
                          className="text-orange-600 hover:text-orange-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        {membresia.estado === 'activa' && (
                          <button
                            onClick={() => handleCambiarPlanClick(membresia)}
                            className="text-purple-600 hover:text-purple-800 transition"
                            title="Cambiar Plan"
                          >
                            <Repeat className="w-5 h-5" />
                          </button>
                        )}

                        {(membresia.estado === 'expirada' || membresia.estado === 'cancelada') && (
                          <button
                            onClick={() => navigate(`/membresias/${membresia.id}/renovar`)}
                            className="text-green-600 hover:text-green-800 transition"
                            title="Renovar Membresía"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                        )}

                        {membresia.estado === 'activa' && (
                          <button
                            onClick={() => handleCancelarClick(membresia)}
                            className="text-yellow-600 hover:text-yellow-800 transition"
                            title="Cancelar Membresía"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}

                        {currentUser?.rol === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(membresia)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal de Eliminar */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Membresía"
        message={`¿Estás seguro de que deseas eliminar la membresía de ${deleteModal.clienteNombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />

      {/* Modal de Cancelar */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={handleCancelarCancel}
        onConfirm={handleCancelarConfirm}
        title="Cancelar Membresía"
        message={`¿Estás seguro de que deseas cancelar la membresía de ${cancelModal.clienteNombre}? Esta acción no se puede deshacer.`}
        confirmText="Cancelar Membresía"
        cancelText="Volver"
        type="warning"
        loading={canceling}
      />

      {/* Modal de Cambiar Plan */}
      {cambiarPlanModal.isOpen &&
        cambiarPlanModal.membresiaId &&
        cambiarPlanModal.planActual && (
          <CambiarPlanPanel
            membresiaId={cambiarPlanModal.membresiaId}
            planActual={cambiarPlanModal.planActual}
            onClose={handleCambiarPlanClose}
            onSuccess={handleCambiarPlanSuccess}
          />
        )}
    </div>
  );
}