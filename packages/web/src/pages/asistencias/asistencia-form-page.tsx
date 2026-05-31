import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

interface AsistenciaFormData {
  clienteId: string;
  marcaTiempo: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email:  string;
}

export function AsistenciaFormPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AsistenciaFormData>({
    clienteId: '',
    marcaTiempo: new Date().toISOString().slice(0, 16),
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoadingData(true);
      const response = await apiClient.clientes.findAll();
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debes seleccionar un cliente';
    }

    if (!formData.marcaTiempo) {
      newErrors.marcaTiempo = 'La fecha y hora son requeridas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await apiClient.asistencias.create({
        clienteId: formData.clienteId,
        marcaTiempo: formData.marcaTiempo,
      });

      toast({
        title: 'Asistencia registrada',
        description: 'La asistencia ha sido registrada correctamente',
      });

      navigate('/asistencias');
    } catch (error:  any) {
      console.error('Error registrando asistencia:', error);
      const message = error.response?.data?.message || 'Error al registrar asistencia';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegistrarAhora = () => {
    setFormData((prev) => ({
      ...prev,
      marcaTiempo: new Date().toISOString().slice(0, 16),
    }));
  };

  const selectedCliente = clientes.find((c) => c.id === formData.clienteId);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/asistencias')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Registrar Asistencia</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div>
              <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.clienteId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} {cliente.apellido} - {cliente.email}
                    </option>
                  ))}
                </select>
              </div>
              {errors.clienteId && <p className="mt-1 text-sm text-red-600">{errors.clienteId}</p>}
              {clientes.length === 0 && (
                <p className="mt-2 text-sm text-yellow-600">
                  No hay clientes disponibles.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/clientes/nuevo')}
                    className="underline hover:text-yellow-700"
                  >
                    Crear un cliente
                  </button>
                </p>
              )}
            </div>

            {/* Fecha y Hora */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="marcaTiempo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha y Hora <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRegistrarAhora}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Usar hora actual
                </button>
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="datetime-local"
                  id="marcaTiempo"
                  name="marcaTiempo"
                  value={formData.marcaTiempo}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus: ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.marcaTiempo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.marcaTiempo && (
                <p className="mt-1 text-sm text-red-600">{errors.marcaTiempo}</p>
              )}
            </div>

            {/* Preview */}
            {selectedCliente && formData.marcaTiempo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Vista Previa del Registro
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-green-700 font-medium mb-1">CLIENTE</p>
                    <p className="text-sm font-semibold text-green-900">
                      {selectedCliente.nombre} {selectedCliente.apellido}
                    </p>
                    <p className="text-xs text-green-600">{selectedCliente.email}</p>
                  </div>

                  <div className="pt-3 border-t border-green-200">
                    <p className="text-xs text-green-700 font-medium mb-1">FECHA Y HORA DE INGRESO</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatDateTime(formData.marcaTiempo)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/asistencias')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={loading}
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Registrando...' : 'Registrar Asistencia'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}