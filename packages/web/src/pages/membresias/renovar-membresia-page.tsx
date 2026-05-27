import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/format';

interface Membresia {
  id: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
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
}

interface Plan {
  id: string;
  nombre: string;
  descripcion?:  string;
  precio: number;
  duracionDias: number;
}

type Step = 1 | 2 | 3;

export function RenovarMembresiaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user:  currentUser } = useAuthStore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [notasPago, setNotasPago] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) {
      navigate('/membresias');
      return;
    }

    try {
      setLoadingData(true);
      const [membresiaRes, planesRes] = await Promise.all([
        apiClient.membresias.findOne(id),
        apiClient.planes.findAll(),
      ]);

      setMembresia(membresiaRes as Membresia);
      setPlanes(planesRes.planes);
      
      // Pre-seleccionar el mismo plan
      setSelectedPlanId(membresiaRes.plan.id);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
      navigate('/membresias');
    } finally {
      setLoadingData(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedPlanId) {
      toast({
        title:  'Selecciona un plan',
        description: 'Debes seleccionar un plan para continuar',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!membresia) return;

    try {
      setLoading(true);

      await apiClient.membresias.renovar({
        membresiaId: membresia.id,
        planId: selectedPlanId,
        metodoPago,
        referenciaPago:  referenciaPago || undefined,
        notasPago:  notasPago || undefined,
      });

      toast({
        title: 'Membresía renovada',
        description: 'La membresía ha sido renovada exitosamente',
      });

      setCurrentStep(3);
    } catch (error:  any) {
      console.error('Error renovando membresía:', error);
      const message = error.response?.data?.message || 'Error al renovar membresía';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = planes.find((p) => p.id === selectedPlanId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month:  'long',
      year: 'numeric',
    });
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  if (!membresia) {
    return null;
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
            <h1 className="text-2xl font-bold text-gray-900">Renovar Membresía</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep >= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-medium text-gray-600">Plan</span>
            <span className="text-xs font-medium text-gray-600">Pago</span>
            <span className="text-xs font-medium text-gray-600">Confirmación</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Info del Cliente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Renovación para: 
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700">Cliente</p>
                <p className="text-sm font-semibold text-blue-900">
                  {membresia.cliente.nombre} {membresia.cliente.apellido}
                </p>
                <p className="text-xs text-blue-600">{membresia.cliente.email}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Membresía anterior</p>
                <p className="text-sm font-semibold text-blue-900">{membresia.plan.nombre}</p>
                <p className="text-xs text-blue-600">
                  Venció:  {formatDate(membresia.fechaFin)}
                </p>
              </div>
            </div>
          </div>

          {/* PASO 1: Seleccionar Plan */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Seleccionar Plan</h2>
              </div>

              {planes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No hay planes disponibles</p>
                  <button
                    onClick={() => navigate('/planes/nuevo')}
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    Crear nuevo plan
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md: grid-cols-2 gap-4">
                  {planes.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-6 border-2 rounded-lg text-left transition ${
                        selectedPlanId === plan.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{plan.nombre}</h3>
                        {plan.id === membresia.plan.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                            Mismo plan
                          </span>
                        )}
                      </div>
                      {plan.descripcion && (
                        <p className="text-sm text-gray-600 mb-3">{plan.descripcion}</p>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(plan.precio)}
                        </span>
                        <span className="text-sm text-gray-500">/ {plan.duracionDias} días</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Registrar Pago */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Registrar Pago</h2>
              </div>

              <div className="space-y-6">
                {/* Resumen */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Cliente: </span>
                    <span className="font-semibold text-gray-900">
                      {membresia.cliente.nombre} {membresia.cliente.apellido}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Plan:</span>
                    <span className="font-semibold text-gray-900">{selectedPlan?.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Duración:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPlan?.duracionDias} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold text-gray-900">Total a pagar:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedPlan && formatCurrency(selectedPlan.precio)}
                    </span>
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'efectivo', label: 'Efectivo' },
                      { value: 'tarjeta', label: 'Tarjeta' },
                      { value:  'transferencia', label: 'Transferencia' },
                    ].map((metodo) => (
                      <button
                        key={metodo.value}
                        type="button"
                        onClick={() => setMetodoPago(metodo.value as any)}
                        className={`p-4 border-2 rounded-lg transition text-center ${
                          metodoPago === metodo.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-700">{metodo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia / N° Transacción
                  </label>
                  <input
                    type="text"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: #12345, REF-001"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={notasPago}
                    onChange={(e) => setNotasPago(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Información adicional..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Confirmación */}
          {currentStep === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Renovación Exitosa</h2>
              <p className="text-gray-600 mb-6">
                La membresía ha sido renovada y el pago registrado correctamente
              </p>

              <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto mb-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <span className="font-semibold text-gray-900">
                      {membresia.cliente.nombre} {membresia.cliente.apellido}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Plan: </span>
                    <span className="font-semibold text-gray-900">{selectedPlan?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duración:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPlan?.duracionDias} días
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Método de pago:</span>
                    <span className="font-semibold text-gray-900">
                      {getMetodoPagoLabel(metodoPago)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold text-gray-900">Total pagado:</span>
                    <span className="text-xl font-bold text-green-600">
                      {selectedPlan && formatCurrency(selectedPlan.precio)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/membresias')}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  Ver Membresías
                </button>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Atrás</span>
              </button>

              {currentStep === 2 ?  (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  <span>{loading ? 'Procesando...' : 'Confirmar Renovación'}</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  <span>Siguiente</span>
                  <Calendar className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}