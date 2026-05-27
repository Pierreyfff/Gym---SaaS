import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionDias: number;
}

interface CambiarPlanPanelProps {
  membresiaId: string;
  planActual: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

export function CambiarPlanPanel({
  membresiaId,
  planActual,
  onClose,
  onSuccess,
}: CambiarPlanPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    nuevoPlanId: '',
    ajustarDuracion: true,
    generarPago: true,
    metodoPago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia',
    nota: '',
  });

  const [diferenciaPrecio, setDiferenciaPrecio] = useState(0);
  const [planSeleccionado, setPlanSeleccionado] = useState<Plan | null>(null);

  useEffect(() => {
    loadPlanes();
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  useEffect(() => {
    if (formData.nuevoPlanId) {
      const plan = planes.find((p) => p.id === formData.nuevoPlanId);
      if (plan) {
        setPlanSeleccionado(plan);
        setDiferenciaPrecio(plan.precio - planActual.precio);
      }
    } else {
      setPlanSeleccionado(null);
      setDiferenciaPrecio(0);
    }
  }, [formData.nuevoPlanId, planes, planActual.precio]);

  const loadPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const response = await apiClient.planes.findAll();
      setPlanes(response.planes.filter((p) => p.id !== planActual.id));
    } catch (error) {
      console.error('Error cargando planes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlanes(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nuevoPlanId) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un plan',
        variant: 'destructive',
      });
      return;
    }

    if (diferenciaPrecio > 0 && formData.generarPago && !formData.metodoPago) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar un método de pago',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const result = await apiClient.membresias.cambiarPlan(membresiaId, formData);

      toast({
        title: 'Plan cambiado exitosamente',
        description: result.mensajeDiferencia,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error cambiando plan:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo cambiar el plan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-200 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel Lateral */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-200 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cambiar Plan de Membresía</h2>
            <p className="text-sm text-gray-600 mt-1">
              Plan actual: <span className="font-semibold">{planActual.nombre}</span> - {formatCurrency(planActual.precio)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seleccionar Nuevo Plan */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nuevo Plan <span className="text-red-600">*</span>
            </label>
            {loadingPlanes ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Cargando planes...
              </div>
            ) : (
              <select
                value={formData.nuevoPlanId}
                onChange={(e) =>
                  setFormData({ ...formData, nuevoPlanId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              >
                <option value="">Seleccionar plan</option>
                {planes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} - {formatCurrency(plan.precio)} ({plan.duracionDias} días)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Información de Diferencia */}
          {planSeleccionado && (
            <div
              className={`p-5 rounded-lg border-2 ${
                diferenciaPrecio > 0
                  ? 'bg-orange-50 border-orange-200'
                  : diferenciaPrecio < 0
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {diferenciaPrecio > 0 ? (
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                ) : diferenciaPrecio < 0 ? (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">
                    {diferenciaPrecio > 0
                      ? 'Upgrade de Plan'
                      : diferenciaPrecio < 0
                        ? 'Downgrade de Plan'
                        : 'Cambio de Plan'}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {planActual.nombre} ({formatCurrency(planActual.precio)}) → {planSeleccionado.nombre} ({formatCurrency(planSeleccionado.precio)})
                  </p>
                  <p className="font-bold text-gray-900 text-lg">
                    Diferencia:{' '}
                    <span
                      className={
                        diferenciaPrecio > 0
                          ? 'text-orange-600'
                          : diferenciaPrecio < 0
                            ? 'text-blue-600'
                            : 'text-gray-600'
                      }
                    >
                      {diferenciaPrecio > 0 ? '+' : ''}
                      {formatCurrency(diferenciaPrecio)}
                    </span>
                  </p>
                  {diferenciaPrecio > 0 && (
                    <p className="text-xs text-orange-700 mt-2 bg-orange-100 px-3 py-2 rounded">
                      El cliente deberá pagar la diferencia
                    </p>
                  )}
                  {diferenciaPrecio < 0 && (
                    <p className="text-xs text-blue-700 mt-2 bg-blue-100 px-3 py-2 rounded">
                      El cliente tendrá crédito a favor
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ajustar Duración */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="ajustarDuracion"
                checked={formData.ajustarDuracion}
                onChange={(e) =>
                  setFormData({ ...formData, ajustarDuracion: e.target.checked })
                }
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 mt-0.5"
              />
              <label htmlFor="ajustarDuracion" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Ajustar duración de membresía
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formData.ajustarDuracion
                    ? `La membresía se extenderá ${planSeleccionado?.duracionDias || 0} días desde hoy`
                    : 'Se mantendrá la fecha de vencimiento actual'}
                </p>
              </label>
            </div>
          </div>

          {/* Generar Pago */}
          {diferenciaPrecio > 0 && (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="generarPago"
                    checked={formData.generarPago}
                    onChange={(e) =>
                      setFormData({ ...formData, generarPago: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500 mt-0.5"
                  />
                  <label htmlFor="generarPago" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-900">
                        Registrar pago de la diferencia
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Se creará un pago por {formatCurrency(diferenciaPrecio)}
                    </p>
                  </label>
                </div>
              </div>

              {formData.generarPago && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Método de Pago <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.metodoPago}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metodoPago: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Nota */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nota <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.nota}
              onChange={(e) =>
                setFormData({ ...formData, nota: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition"
              placeholder="Agregar nota sobre el cambio de plan..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nuevoPlanId}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirmar Cambio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}