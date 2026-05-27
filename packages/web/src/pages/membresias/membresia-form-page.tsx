import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, CreditCard } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

interface MembresiaFormData {
  clienteId: string;
  planId: string;
  fechaInicio: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email:  string;
}

interface Plan {
  id:  string;
  nombre: string;
  precio: number;
  duracionDias: number;
  descripcion?:  string;
}

export function MembresiaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user:  currentUser } = useAuthStore();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<MembresiaFormData>({
    clienteId: '',
    planId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadMembresia();
    }
  }, [id, clientes.length, planes.length]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientesRes, planesRes] = await Promise.all([
        apiClient.clientes.findAll(),
        apiClient.planes.findAll(),
      ]);

      setClientes(clientesRes.clientes);
      setPlanes(planesRes.planes);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos necesarios',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadMembresia = async () => {
    if (!id) return;

    try {
      const membresia = await apiClient.membresias.findOne(id);

      setFormData({
        clienteId: membresia.cliente.id,
        planId: membresia.plan.id,
        fechaInicio: new Date(membresia.fechaInicio).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error cargando membresía:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la membresía',
        variant: 'destructive',
      });
      navigate('/membresias');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debes seleccionar un cliente';
    }

    if (!formData.planId) {
      newErrors.planId = 'Debes seleccionar un plan';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e:  React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        await apiClient.membresias.update(id!, {
          fechaInicio: formData.fechaInicio,
        });

        toast({
          title: 'Membresía actualizada',
          description: 'La membresía ha sido actualizada correctamente',
        });
      } else {
        await apiClient.membresias.create(formData);

        toast({
          title: 'Membresía creada',
          description:  'La membresía ha sido creada correctamente',
        });
      }

      navigate('/membresias');
    } catch (error:  any) {
      console.error('Error guardando membresía:', error);
      const message = error.response?.data?.message || 'Error al guardar membresía';

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

  const selectedCliente = clientes.find((c) => c.id === formData.clienteId);
  const selectedPlan = planes.find((p) => p.id === formData.planId);

  const calculateFechaFin = () => {
    if (!formData.fechaInicio || !selectedPlan) return null;

    const inicio = new Date(formData.fechaInicio);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + selectedPlan.duracionDias);
    return fin;
  };

  const fechaFin = calculateFechaFin();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month:  'long',
      year: 'numeric',
    });
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/membresias')}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Membresía' : 'Nueva Membresía'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div>
              <label htmlFor="clienteId" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.clienteId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading || isEditing}
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
            </div>

            {/* Plan */}
            <div>
              <label htmlFor="planId" className="block text-sm font-medium text-gray-700 mb-1">
                Plan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  id="planId"
                  name="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.planId ? 'border-red-500' :  'border-gray-300'
                  }`}
                  disabled={loading || isEditing}
                >
                  <option value="">Seleccionar plan...</option>
                  {planes.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} - {formatCurrency(plan.precio)} ({plan.duracionDias} días)
                    </option>
                  ))}
                </select>
              </div>
              {errors.planId && <p className="mt-1 text-sm text-red-600">{errors.planId}</p>}
            </div>

            {/* Fecha Inicio */}
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.fechaInicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.fechaInicio && <p className="mt-1 text-sm text-red-600">{errors.fechaInicio}</p>}
            </div>

            {/* Preview */}
            {selectedCliente && selectedPlan && fechaFin && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Vista Previa de la Membresía
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-orange-700 font-medium mb-1">CLIENTE</p>
                      <p className="text-sm font-semibold text-orange-900">
                        {selectedCliente.nombre} {selectedCliente.apellido}
                      </p>
                      <p className="text-xs text-orange-600">{selectedCliente.email}</p>
                    </div>

                    <div>
                      <p className="text-xs text-orange-700 font-medium mb-1">PLAN</p>
                      <p className="text-sm font-semibold text-orange-900">{selectedPlan.nombre}</p>
                      {selectedPlan.descripcion && (
                        <p className="text-xs text-orange-600">{selectedPlan.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-orange-700 font-medium mb-1">DURACIÓN</p>
                      <p className="text-sm font-semibold text-orange-900">{selectedPlan.duracionDias} días</p>
                    </div>

                    <div>
                      <p className="text-xs text-orange-700 font-medium mb-1">VIGENCIA</p>
                      <p className="text-sm text-orange-900">
                        {formatDate(new Date(formData.fechaInicio))} - {formatDate(fechaFin)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-orange-200">
                      <p className="text-xs text-orange-700 font-medium mb-1">PRECIO</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedPlan.precio)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/membresias')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={loading}
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}