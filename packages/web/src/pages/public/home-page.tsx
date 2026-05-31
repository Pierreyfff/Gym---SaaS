import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { formatCurrency } from '@/lib/format';
import {
  Star,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  PublicConfiguracion,
  PublicPlan,
  PublicTestimonio,
} from '@gym-saas/api-client';

export function HomePage() {
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [planes, setPlanes] = useState<PublicPlan[]>([]);
  const [testimonios, setTestimonios] = useState<PublicTestimonio[]>([]);
  const [loading, setLoading] = useState(true);
  const [carruselIndex, setCarruselIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-avanzar carrusel cada 5 segundos
  useEffect(() => {
    if (!config?.imagenesCarrusel || config.imagenesCarrusel.length === 0)
      return;

    const interval = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % config.imagenesCarrusel.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [config]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, planesData, testimoniosData] = await Promise.all([
        apiClient.public.getConfiguracion(),
        apiClient.public.getPlanes(),
        apiClient.public.getTestimonios(),
      ]);

      setConfig(configData);
      setPlanes(planesData.planes);
      setTestimonios(testimoniosData.testimonios.slice(0, 3));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (calificacion: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < calificacion
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const nextSlide = () => {
    if (!config?.imagenesCarrusel) return;
    setCarruselIndex((prev) => (prev + 1) % config.imagenesCarrusel.length);
  };

  const prevSlide = () => {
    if (!config?.imagenesCarrusel) return;
    setCarruselIndex((prev) =>
      prev === 0 ? config.imagenesCarrusel.length - 1 : prev - 1,
    );
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">Cargando...</div>
        </div>
      </PublicLayout>
    );
  }

  const colorPrimario = config?.colorPrimario || '#10b981';
  const colorSecundario = config?.colorSecundario || '#3b82f6';
  const imagenesCarrusel = config?.imagenesCarrusel || [];

  return (
    <PublicLayout>
      {/* Hero Section con Carrusel */}
      <section className="relative h-[700px] overflow-hidden">
        {/* Carrusel de fondo */}
        {imagenesCarrusel.length > 0 ? (
          <div className="absolute inset-0">
            {imagenesCarrusel.map((imagen, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === carruselIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={imagen}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = config?.imagenHero || '';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
              </div>
            ))}

            {/* Controles del carrusel */}
            {imagenesCarrusel.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-950/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-950/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {imagenesCarrusel.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarruselIndex(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        index === carruselIndex ? 'bg-white dark:bg-gray-950' : 'bg-white dark:bg-gray-950/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Fallback: imagen hero o gradiente
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: config?.imagenHero
                ? `url(${config.imagenHero})`
                : `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
          </div>
        )}

        {/* Contenido Hero */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center z-20">
          <div className="text-white max-w-2xl animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              {config?.nombreNegocio || 'Transforma Tu Cuerpo'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 drop-shadow">
              {config?.descripcionCorta ||
                'El mejor gimnasio de la ciudad con entrenadores certificados'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/planes-publicos"
                className="bg-white dark:bg-gray-950 hover:scale-105 text-gray-900 dark:text-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition transform shadow-lg"
                style={{ color: colorPrimario }}
              >
                Ver Planes
              </Link>
              <Link
                to="/contacto"
                className="border-2 border-white hover:bg-white hover:text-gray-900 dark:hover:text-gray-100 text-white px-8 py-4 rounded-lg font-bold text-lg transition"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Nuestros Planes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Elige el plan perfecto para ti
            </p>
          </div>

          {planes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No hay planes disponibles en este momento
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {planes.map((plan, index) => (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    borderTop: `4px solid ${colorPrimario}`,
                  }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {plan.nombre}
                  </h3>
                  <div className="mb-6">
                    <span
                      className="text-5xl font-bold"
                      style={{ color: colorPrimario }}
                    >
                      {formatCurrency(Number(plan.precio))}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      / {plan.duracionDias} días
                    </span>
                  </div>
                  {plan.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 mb-6 min-h-[48px]">
                      {plan.descripcion}
                    </p>
                  )}
                  <div className="space-y-3 mb-8">
                    {[
                      'Acceso ilimitado al gimnasio',
                      'Entrenadores certificados',
                      'Equipamiento moderno',
                      'Clases grupales incluidas',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: colorPrimario }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/contacto"
                    className="block w-full text-center px-6 py-3 rounded-lg font-bold text-white transition hover:opacity-90"
                    style={{ backgroundColor: colorPrimario }}
                  >
                    Inscribirme Ahora
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonios Section */}
      {testimonios.length > 0 && (
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Lo Que Dicen Nuestros Clientes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Historias reales de transformación
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonios.map((testimonio, index) => (
                <div
                  key={testimonio.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    {testimonio.imagenUrl ? (
                      <img
                        src={testimonio.imagenUrl}
                        alt={testimonio.nombreCliente}
                        className="w-16 h-16 rounded-full object-cover"
                        style={{ boxShadow: `0 0 0 4px ${colorPrimario}40` }}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonio.nombreCliente}&background=random`;
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${colorPrimario}20` }}
                      >
                        <span
                          className="text-2xl font-bold"
                          style={{ color: colorPrimario }}
                        >
                          {testimonio.nombreCliente.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {testimonio.nombreCliente}
                      </h4>
                      {renderStars(testimonio.calificacion)}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{testimonio.contenido}"
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/nosotros"
                className="inline-flex items-center gap-2 font-bold text-lg hover:underline transition"
                style={{ color: colorPrimario }}
              >
                Ver más testimonios
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        className="py-24 text-white"
        style={{
          background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h2 className="text-5xl font-bold mb-6">¿Listo Para Empezar?</h2>
          <p className="text-2xl mb-10 text-white/90">
            Únete a nuestra comunidad y transforma tu vida hoy mismo
          </p>
          <Link
            to="/contacto"
            className="inline-block bg-white dark:bg-gray-950 px-10 py-5 rounded-lg font-bold text-xl transition hover:scale-105 transform shadow-2xl"
            style={{ color: colorPrimario }}
          >
            Contactar Ahora
          </Link>
        </div>
      </section>

      {/* Estilos de animaciones */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </PublicLayout>
  );
}

