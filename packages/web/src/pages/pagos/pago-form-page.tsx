import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function PagoFormPage() {
  const navigate = useNavigate();
  const { user:  currentUser } = useAuthStore();

  useEffect(() => {
    // Redirigir automáticamente al wizard de inscripción
    navigate('/inscripciones/nueva');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pagos')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Registrar Pago</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
          <Info className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            Los pagos ahora se registran automáticamente
          </h2>
          <p className="text-blue-700 mb-6">
            Utiliza el wizard de inscripción para crear membresías y registrar pagos en una sola transacción.
          </p>
          <button
            onClick={() => navigate('/inscripciones/nueva')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Ir al Wizard de Inscripción
          </button>
        </div>
      </main>
    </div>
  );
}