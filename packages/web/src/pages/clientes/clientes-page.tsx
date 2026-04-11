import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  User,
  Download,
  Eye,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ConfirmationModal } from '@/components/shared/confirmation-modal';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/lib/utils/download-file';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';

interface Cliente {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: string;
  perfil?: {
    fechaNacimiento?: Date;
    genero?: string;
    notas?: string;
  };
}

export function ClientesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clienteId: string | null;
    clienteName: string;
  }>({
    isOpen: false,
    clienteId: null,
    clienteName: '',
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.clientes.findAll();
      setClientes(response.clientes as Cliente[]);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setDeleteModal({
      isOpen: true,
      clienteId: cliente.id,
      clienteName: `${cliente.nombre} ${cliente.apellido}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.clienteId) return;

    try {
      setDeleting(true);
      await apiClient.clientes.delete(deleteModal.clienteId);

      toast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado correctamente',
      });

      await loadClientes();
      setDeleteModal({ isOpen: false, clienteId: null, clienteName: '' });
    } catch (error) {
      console.error('Error eliminando cliente:', error);

      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, clienteId: null, clienteName: '' });
  };

  const filteredClientes = clientes.filter((cliente) =>
    `${cliente.nombre} ${cliente.apellido} ${cliente.email}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase()),
  );

  const getStatusBadgeColor = (estado: string) => {
    return estado === 'activo'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
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
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Clientes
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  await downloadFile(
                    `${import.meta.env.VITE_API_URL}/export/clientes/excel`,
                    `clientes_${Date.now()}.xlsx`,
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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => navigate('/clientes/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : filteredClientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">
              No se encontraron clientes
            </p>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Género
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Nacimiento
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
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nombre} {cliente.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {cliente.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {cliente.telefono || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 capitalize">
                        {cliente.perfil?.genero || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(cliente.perfil?.fechaNacimiento)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          cliente.estado,
                        )}`}
                      >
                        {cliente.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/clientes/${cliente.id}`)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Ver Perfil"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/clientes/${cliente.id}/editar`)
                          }
                          className="text-green-600 hover:text-green-800 transition"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {currentUser?.rol === 'admin' && (
                          <button
                            onClick={() => handleDeleteClick(cliente)}
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

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar a ${deleteModal.clienteName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}