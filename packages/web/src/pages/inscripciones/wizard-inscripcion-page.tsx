import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  UserCheck,
  CreditCard,
  DollarSign,
  Lock,
  Shield,
  Calendar,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

interface Plan {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionDias: number;
}

type Step = 1 | 2 | 3 | 4 | 5;

type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'stripe' | 'paypal';

interface PaymentValidation {
  isValid: boolean;
  errors: string[];
}

export function WizardInscripcionPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);

  // Paso 1: Cliente
  const [selectedClienteId, setSelectedClienteId] = useState('');

  // Paso 2: Plan
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Paso 3: Método de Pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');

  // Paso 4: Detalles de Pago (según método)
  const [pagoEfectivo, setPagoEfectivo] = useState({
    referencia: '',
    notas: '',
  });

  const [pagoTarjeta, setPagoTarjeta] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    guardarTarjeta: false,
  });

  const [pagoTransferencia, setPagoTransferencia] = useState({
    banco: '',
    numeroReferencia: '',
    fechaTransferencia: new Date().toISOString().split('T')[0],
    comprobante: null as File | null,
  });

  // Estado de validación
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [clientesRes, planesRes] = await Promise.all([
        apiClient.clientes.findDisponiblesMembresia(),
        apiClient.planes.findAll(),
      ]);
      setClientes(clientesRes.clientes);
      setPlanes(planesRes.planes);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  // Validaciones por paso
  const validateStep1 = (): PaymentValidation => {
    const errors: string[] = [];
    if (!selectedClienteId) {
      errors.push('Debes seleccionar un cliente');
    }
    return { isValid: errors.length === 0, errors };
  };

  const validateStep2 = (): PaymentValidation => {
    const errors: string[] = [];
    if (!selectedPlanId) {
      errors.push('Debes seleccionar un plan');
    }
    return { isValid: errors.length === 0, errors };
  };

  const validateStep3 = (): PaymentValidation => {
    const errors: string[] = [];
    if (!metodoPago) {
      errors.push('Debes seleccionar un método de pago');
    }
    return { isValid: errors.length === 0, errors };
  };

  const validateStep4 = (): PaymentValidation => {
    const errors: string[] = [];

    if (metodoPago === 'tarjeta') {
      if (!pagoTarjeta.numeroTarjeta || pagoTarjeta.numeroTarjeta.replace(/\s/g, '').length !== 16) {
        errors.push('Número de tarjeta inválido (debe tener 16 dígitos)');
      }
      if (!pagoTarjeta.nombreTitular) {
        errors.push('Nombre del titular es requerido');
      }
      if (!pagoTarjeta.fechaExpiracion || !/^\d{2}\/\d{2}$/.test(pagoTarjeta.fechaExpiracion)) {
        errors.push('Fecha de expiración inválida (MM/AA)');
      }
      if (!pagoTarjeta.cvv || pagoTarjeta.cvv.length < 3) {
        errors.push('CVV inválido (3 o 4 dígitos)');
      }
    }

    if (metodoPago === 'transferencia') {
      if (!pagoTransferencia.banco) {
        errors.push('Debes seleccionar un banco');
      }
      if (!pagoTransferencia.numeroReferencia) {
        errors.push('Número de referencia es requerido');
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleNext = () => {
    let validation: PaymentValidation = { isValid: true, errors: [] };

    if (currentStep === 1) validation = validateStep1();
    if (currentStep === 2) validation = validateStep2();
    if (currentStep === 3) validation = validateStep3();
    if (currentStep === 4) validation = validateStep4();

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: 'Validación fallida',
        description: validation.errors[0],
        variant: 'destructive',
      });
      return;
    }

    setValidationErrors([]);

    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setValidationErrors([]);
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    const validation = validateStep4();
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: 'Validación fallida',
        description: validation.errors[0],
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setProcessingPayment(true);

      // Simulación de procesamiento de pago (aquí iría Stripe/PayPal)
      if (metodoPago === 'tarjeta' || metodoPago === 'stripe') {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular latencia
      }

      // Preparar datos según método de pago
      let paymentData: any = {};

      if (metodoPago === 'efectivo') {
        paymentData = {
          referenciaPago: pagoEfectivo.referencia || undefined,
          notasPago: pagoEfectivo.notas || undefined,
        };
      } else if (metodoPago === 'tarjeta') {
        // En producción, aquí generarías un token con Stripe/PayPal
        paymentData = {
          referenciaPago: `CARD-${Date.now()}`,
          notasPago: `Pago con tarjeta terminada en ${pagoTarjeta.numeroTarjeta.slice(-4)}`,
        };
      } else if (metodoPago === 'transferencia') {
        paymentData = {
          referenciaPago: pagoTransferencia.numeroReferencia,
          notasPago: `Transferencia desde ${pagoTransferencia.banco}`,
        };
      }

      await apiClient.inscripciones.create({
        clienteId: selectedClienteId,
        planId: selectedPlanId,
        metodoPago: metodoPago === 'stripe' ? 'tarjeta' : metodoPago,
        ...paymentData,
      });

      toast({
        title: 'Inscripción exitosa',
        description: 'La membresía y el pago han sido registrados correctamente',
      });

      setCurrentStep(5);
    } catch (error: any) {
      console.error('Error creando inscripción:', error);
      const message = error.response?.data?.message || 'Error al procesar el pago';

      toast({
        title: 'Error en el pago',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId);
  const selectedPlan = planes.find((p) => p.id === selectedPlanId);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/membresias')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
              disabled={loading}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Inscripción</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                    currentStep >= step
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  } ${currentStep === step ? 'ring-4 ring-blue-200' : ''}`}
                >
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-2 mx-2 rounded-full transition-all ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cliente</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Plan</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Método</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pago</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirmación</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
              {/* PASO 1: Seleccionar Cliente */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seleccionar Cliente</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paso 1 de 5</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Solo clientes sin membresía activa
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Los clientes con membresías activas no pueden inscribirse hasta que su
                        membresía actual expire o sea cancelada.
                      </p>
                    </div>
                  </div>

                  {clientes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <UserCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                        No hay clientes disponibles para inscripción
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Todos los clientes ya tienen una membresía activa o no hay clientes
                        registrados
                      </p>
                      <button
                        onClick={() => navigate('/clientes/nuevo')}
                        className="text-blue-600 hover:text-blue-700 font-semibold underline"
                      >
                        Crear nuevo cliente
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Buscar cliente por nombre o email..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {clientes.map((cliente) => (
                          <button
                            key={cliente.id}
                            onClick={() => setSelectedClienteId(cliente.id)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              selectedClienteId === cliente.id
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                  {cliente.nombre} {cliente.apellido}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{cliente.email}</p>
                                {cliente.telefono && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.telefono}</p>
                                )}
                              </div>
                              {selectedClienteId === cliente.id && (
                                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PASO 2: Seleccionar Plan */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seleccionar Plan</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paso 2 de 5</p>
                    </div>
                  </div>

                  {planes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">No hay planes disponibles</p>
                      <button
                        onClick={() => navigate('/planes/nuevo')}
                        className="text-blue-600 hover:text-blue-700 font-semibold underline"
                      >
                        Crear nuevo plan
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {planes.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-lg ${
                            selectedPlanId === plan.id
                              ? 'border-purple-500 bg-purple-50 shadow-xl scale-105'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{plan.nombre}</h3>
                            {selectedPlanId === plan.id && (
                              <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
                            )}
                          </div>
                          {plan.descripcion && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.descripcion}</p>
                          )}
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold text-purple-600">
                              {formatCurrency(plan.precio)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{plan.duracionDias} días de acceso</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3: Método de Pago */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Método de Pago</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paso 3 de 5</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Efectivo */}
                    <button
                      onClick={() => setMetodoPago('efectivo')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        metodoPago === 'efectivo'
                          ? 'border-green-500 bg-green-50 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        {metodoPago === 'efectivo' && (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Efectivo</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pago en persona al momento</p>
                    </button>

                    {/* Tarjeta */}
                    <button
                      onClick={() => setMetodoPago('tarjeta')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        metodoPago === 'tarjeta'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                        {metodoPago === 'tarjeta' && (
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Tarjeta</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Débito o crédito</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Pago seguro</span>
                      </div>
                    </button>

                    {/* Transferencia */}
                    <button
                      onClick={() => setMetodoPago('transferencia')}
                      className={`p-6 border-2 rounded-xl text-left transition-all ${
                        metodoPago === 'transferencia'
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-8 h-8 text-purple-600" />
                        {metodoPago === 'transferencia' && (
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Transferencia</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bancaria o electrónica</p>
                    </button>

                    {/* Stripe (Futuro) */}
                    <button
                      disabled
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-left opacity-50 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Shield className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Stripe / PayPal</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Próximamente</p>
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: Detalles de Pago */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Detalles de Pago</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paso 4 de 5</p>
                    </div>
                  </div>

                  {/* Errors */}
                  {validationErrors.length > 0 && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 mb-1">Errores de validación:</p>
                          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Efectivo */}
                  {metodoPago === 'efectivo' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Referencia / Recibo
                        </label>
                        <input
                          type="text"
                          value={pagoEfectivo.referencia}
                          onChange={(e) =>
                            setPagoEfectivo({ ...pagoEfectivo, referencia: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ej: REC-001, #12345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Notas
                        </label>
                        <textarea
                          value={pagoEfectivo.notas}
                          onChange={(e) =>
                            setPagoEfectivo({ ...pagoEfectivo, notas: e.target.value })
                          }
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          placeholder="Información adicional del pago..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Tarjeta */}
                  {metodoPago === 'tarjeta' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-4 mb-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Transacción segura</p>
                          <p>
                            Tus datos están protegidos con encriptación de nivel bancario SSL.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Número de Tarjeta
                        </label>
                        <input
                          type="text"
                          value={pagoTarjeta.numeroTarjeta}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value);
                            if (formatted.replace(/\s/g, '').length <= 16) {
                              setPagoTarjeta({ ...pagoTarjeta, numeroTarjeta: formatted });
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nombre del Titular
                        </label>
                        <input
                          type="text"
                          value={pagoTarjeta.nombreTitular}
                          onChange={(e) =>
                            setPagoTarjeta({
                              ...pagoTarjeta,
                              nombreTitular: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                          placeholder="JUAN PEREZ"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de Expiración
                          </label>
                          <input
                            type="text"
                            value={pagoTarjeta.fechaExpiracion}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value);
                              if (formatted.length <= 5) {
                                setPagoTarjeta({ ...pagoTarjeta, fechaExpiracion: formatted });
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="MM/AA"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={pagoTarjeta.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                setPagoTarjeta({ ...pagoTarjeta, cvv: value });
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="guardarTarjeta"
                          checked={pagoTarjeta.guardarTarjeta}
                          onChange={(e) =>
                            setPagoTarjeta({ ...pagoTarjeta, guardarTarjeta: e.target.checked })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="guardarTarjeta" className="text-sm text-gray-700 dark:text-gray-300">
                          Guardar tarjeta para futuros pagos
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Transferencia */}
                  {metodoPago === 'transferencia' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Banco
                        </label>
                        <select
                          value={pagoTransferencia.banco}
                          onChange={(e) =>
                            setPagoTransferencia({ ...pagoTransferencia, banco: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar banco</option>
                          <option value="BCP">Banco de Crédito del Perú</option>
                          <option value="BBVA">BBVA</option>
                          <option value="Interbank">Interbank</option>
                          <option value="Scotiabank">Scotiabank</option>
                          <option value="BanBif">BanBif</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Número de Referencia / Operación
                        </label>
                        <input
                          type="text"
                          value={pagoTransferencia.numeroReferencia}
                          onChange={(e) =>
                            setPagoTransferencia({
                              ...pagoTransferencia,
                              numeroReferencia: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: 000123456789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Fecha de Transferencia
                        </label>
                        <input
                          type="date"
                          value={pagoTransferencia.fechaTransferencia}
                          onChange={(e) =>
                            setPagoTransferencia({
                              ...pagoTransferencia,
                              fechaTransferencia: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Comprobante (Opcional)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setPagoTransferencia({ ...pagoTransferencia, comprobante: file });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sube una imagen o PDF del comprobante de transferencia
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 5: Confirmación */}
              {currentStep === 5 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <Check className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Inscripción Exitosa
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                    La membresía y el pago han sido registrados correctamente
                  </p>

                  <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 p-8 rounded-xl max-w-md mx-auto mb-8 shadow-lg">
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cliente:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {selectedCliente?.nombre} {selectedCliente?.apellido}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Plan:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">{selectedPlan?.nombre}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Duración:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {selectedPlan?.duracionDias} días
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Método de pago:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">{metodoPago}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3">
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">Total pagado:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {selectedPlan && formatCurrency(selectedPlan.precio)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate('/membresias')}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Ver Membresías
                    </button>
                    <button
                      onClick={() => {
                        setCurrentStep(1);
                        setSelectedClienteId('');
                        setSelectedPlanId('');
                        setMetodoPago('efectivo');
                        setPagoEfectivo({ referencia: '', notas: '' });
                        setPagoTarjeta({
                          numeroTarjeta: '',
                          nombreTitular: '',
                          fechaExpiracion: '',
                          cvv: '',
                          guardarTarjeta: false,
                        });
                        setPagoTransferencia({
                          banco: '',
                          numeroReferencia: '',
                          fechaTransferencia: new Date().toISOString().split('T')[0],
                          comprobante: null,
                        });
                        setValidationErrors([]);
                        loadData();
                      }}
                      className="px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      Nueva Inscripción
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1 || loading}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Atrás</span>
                  </button>

                  {currentStep === 4 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={loading || processingPayment}
                      className="flex items-center gap-3 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl disabled:hover:scale-100 hover:scale-105"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Procesando pago...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Confirmar y Pagar</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={
                        loading ||
                        (currentStep === 1 && clientes.length === 0) ||
                        (currentStep === 2 && planes.length === 0)
                      }
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-xl disabled:hover:scale-100 hover:scale-105"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Resumen */}
          {currentStep < 5 && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Resumen de Inscripción
                </h3>

                <div className="space-y-4">
                  {/* Cliente */}
                  <div className="pb-4 border-b">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Cliente</p>
                    {selectedCliente ? (
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {selectedCliente.nombre} {selectedCliente.apellido}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCliente.email}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No seleccionado</p>
                    )}
                  </div>

                  {/* Plan */}
                  <div className="pb-4 border-b">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Plan</p>
                    {selectedPlan ? (
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{selectedPlan.nombre}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.duracionDias} días</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {formatCurrency(selectedPlan.precio)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No seleccionado</p>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div className="pb-4 border-b">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Método de Pago
                    </p>
                    {metodoPago && currentStep >= 3 ? (
                      <p className="font-bold text-gray-900 dark:text-gray-100 capitalize">{metodoPago}</p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No seleccionado</p>
                    )}
                  </div>

                  {/* Total */}
                  {selectedPlan && (
                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(selectedPlan.precio)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 dark:text-gray-300">Descuento:</span>
                        <span className="font-semibold text-green-600">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedPlan.precio)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Transacción segura y encriptada</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}