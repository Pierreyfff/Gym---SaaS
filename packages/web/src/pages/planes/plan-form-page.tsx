import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

interface PlanFormData {
  nombre: string;
  descripcion:  string;
  duracionDias: string;
  precio: string;
}

export function PlanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<PlanFormData>({
    nombre: '',
    descripcion: '',
    duracionDias: '',
    precio: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadPlan();
    }
  }, [id]);

  const loadPlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const plan = await apiClient.planes.findOne(id);

      setFormData({
        nombre: plan.nombre,
        descripcion: plan.descripcion || '',
        duracionDias:  plan.duracionDias.toString(),
        precio: plan.precio.toString(),
      });
    } catch (error) {
      console.error('Error cargando plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el plan',
        variant: 'destructive',
      });
      navigate('/planes');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    const duracion = parseInt(formData.duracionDias);
    if (!formData.duracionDias || isNaN(duracion) || duracion < 1) {
      newErrors.duracionDias = 'La duración debe ser al menos 1 día';
    }

    const precio = parseFloat(formData.precio);
    if (!formData.precio || isNaN(precio) || precio < 0) {
      newErrors.precio = 'El precio debe ser un valor positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const planData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        duracionDias:  parseInt(formData.duracionDias),
        precio: parseFloat(formData.precio),
      };

      if (isEditing) {
        await apiClient.planes.update(id!, planData);

        toast({
          title: 'Plan actualizado',
          description: 'El plan ha sido actualizado correctamente',
        });
      } else {
        await apiClient.planes.create(planData);

        toast({
          title: 'Plan creado',
          description: 'El plan ha sido creado correctamente',
        });
      }

      navigate('/planes');
    } catch (error:  any) {
      console.error('Error guardando plan:', error);
      const message = error.response?.data?.message || 'Error al guardar plan';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const duracionPresets = [
    { value: '30', label: '1 mes (30 días)' },
    { value: '90', label:  '3 meses (90 días)' },
    { value: '180', label: '6 meses (180 días)' },
    { value: '365', label: '1 año (365 días)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/planes')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Editar Plan' : 'Nuevo Plan'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Plan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.nombre ?  'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={loading}
                placeholder="Ej: Plan Mensual, Plan Premium"
              />
              {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus: ring-purple-500 focus: border-transparent resize-none"
                disabled={loading}
                placeholder="Descripción del plan..."
              />
            </div>

            {/* Duración */}
            <div>
              <label htmlFor="duracionDias" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {duracionPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, duracionDias: preset.value }));
                      setErrors((prev) => ({ ...prev, duracionDias: '' }));
                    }}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition ${
                      formData.duracionDias === preset.value
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    disabled={loading}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="duracionDias"
                  name="duracionDias"
                  value={formData.duracionDias}
                  onChange={handleChange}
                  min="1"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.duracionDias ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                  placeholder="Días"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">días</span>
              </div>
              {errors.duracionDias && (
                <p className="mt-1 text-sm text-red-600">{errors.duracionDias}</p>
              )}
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.precio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
              {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
            </div>

            {/* Preview */}
            {formData.nombre && formData.precio && formData.duracionDias && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-purple-900 mb-2">Vista Previa</h3>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-purple-900">{formData.nombre}</p>
                  {formData.descripcion && (
                    <p className="text-sm text-purple-700">{formData.descripcion}</p>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-purple-200">
                    <span className="text-2xl font-bold text-purple-600">
                      ${parseFloat(formData.precio || '0').toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-purple-700">
                      {parseInt(formData.duracionDias) === 30 && '1 mes'}
                      {parseInt(formData.duracionDias) === 90 && '3 meses'}
                      {parseInt(formData.duracionDias) === 180 && '6 meses'}
                      {parseInt(formData.duracionDias) === 365 && '1 año'}
                      {![30, 90, 180, 365].includes(parseInt(formData.duracionDias)) &&
                        `${formData.duracionDias} días`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/planes')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
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