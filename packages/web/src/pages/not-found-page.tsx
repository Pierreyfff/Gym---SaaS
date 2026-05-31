import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Página no encontrada
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-xl p-8 mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            ¿Qué te gustaría hacer?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver atrás</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              <Home className="w-5 h-5" />
              <span>Ir al Dashboard</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/clientes')}
            className="p-4 bg-white dark:bg-gray-950 rounded-lg shadow hover:shadow-lg transition text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            Clientes
          </button>
          <button
            onClick={() => navigate('/membresias')}
            className="p-4 bg-white dark:bg-gray-950 rounded-lg shadow hover:shadow-lg transition text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            Membresías
          </button>
          <button
            onClick={() => navigate('/pagos')}
            className="p-4 bg-white dark:bg-gray-950 rounded-lg shadow hover:shadow-lg transition text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            Pagos
          </button>
          <button
            onClick={() => navigate('/productos')}
            className="p-4 bg-white dark:bg-gray-950 rounded-lg shadow hover:shadow-lg transition text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            Productos
          </button>
        </div>
      </div>
    </div>
  );
}