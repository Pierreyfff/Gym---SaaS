import { useState, useEffect } from 'react';
import { X, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

interface ReembolsarPagoPanelProps {
  pagoId: string;
  monto: number;
  clienteNombre: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReembolsarPagoPanel({
  pagoId,
  monto,
  clienteNombre,
  onClose,
  onSuccess,
}: ReembolsarPagoPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    motivo: '',
    notas: '',
  });

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.motivo.trim()) {
      toast({
        title: 'Error',
        description: 'Debes indicar el motivo del reembolso',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await apiClient.pagos.reembolsar(pagoId, formData);

      toast({
        title: 'Pago reembolsado',
        description: `Se ha reembolsado ${formatCurrency(monto)} a ${clienteNombre}`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error reembolsando pago:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo reembolsar el pago',
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
        className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-200 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reembolsar Pago</h2>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
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
          {/* Información del pago */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-900 text-lg">Monto a reembolsar</span>
            </div>
            <p className="text-4xl font-bold text-red-600 mb-3">{formatCurrency(monto)}</p>
            <div className="pt-3 border-t border-red-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Cliente:</span> {clienteNombre}
              </p>
            </div>
          </div>

          {/* Motivo del reembolso */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Motivo del Reembolso <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              required
            >
              <option value="">Seleccionar motivo</option>
              <option value="Cancelación de membresía">Cancelación de membresía</option>
              <option value="Error en el cobro">Error en el cobro</option>
              <option value="Solicitud del cliente">Solicitud del cliente</option>
              <option value="Servicio no prestado">Servicio no prestado</option>
              <option value="Duplicado">Pago duplicado</option>
              <option value="Otro">Otro motivo</option>
            </select>
          </div>

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notas Adicionales <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition"
              placeholder="Detalles adicionales sobre el reembolso..."
            />
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-semibold mb-2">Advertencia</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>El estado del pago cambiará a "Reembolsado"</li>
                  <li>Esta acción no se puede deshacer</li>
                  <li>Deberás devolver el dinero al cliente manualmente</li>
                </ul>
              </div>
            </div>
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
              disabled={loading || !formData.motivo}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  <span>Confirmar Reembolso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}