import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { CheckCircle, Star, Zap } from 'lucide-react';
import type { PublicPlan, PublicConfiguracion } from '@gym-saas/api-client';

export function PlanesPublicosPage() {
  const [planes, setPlanes] = useState<PublicPlan[]>([]);
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planesData, configData] = await Promise.all([
        apiClient.public.getPlanes(),
        apiClient.public.getConfiguracion(),
      ]);
      setPlanes(planesData.planes);
      setConfig(configData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Cargando planes...</div>
        </div>
      </PublicLayout>
    );
  }

  const colorPrimario = config?.colorPrimario || '#10b981';
  const colorSecundario = config?.colorSecundario || '#3b82f6';

  // Determinar plan destacado (el del medio si hay 3, o el segundo)
  const planDestacadoIndex = Math.floor(planes.length / 2);

  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="py-24 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-bold mb-6">Nuestros Planes</h1>
          <p className="text-2xl max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus objetivos y estilo de vida
          </p>
        </div>
      </section>

      {/* Planes */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {planes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-xl">No hay planes disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {planes.map((plan, index) => {
                const isDestacado = index === planDestacadoIndex;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-fade-in-up ${
                      isDestacado ? 'lg:scale-110 z-10' : ''
                    }`}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      borderTop: isDestacado ? `6px solid ${colorPrimario}` : `3px solid ${colorPrimario}40`,
                    }}
                  >
                    {/* Badge destacado */}
                    {isDestacado && (
                      <div
                        className="text-white text-sm font-bold px-6 py-2 text-center flex items-center justify-center gap-2"
                        style={{ backgroundColor: colorPrimario }}
                      >
                        <Star className="w-4 h-4 fill-white" />
                        MÁS POPULAR
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}

                    <div className="p-8">
                      {/* Header del plan */}
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          {plan.nombre}
                        </h3>
                        
                        {/* Precio */}
                        <div className="mb-4">
                          <span 
                            className="text-5xl font-bold"
                            style={{ color: colorPrimario }}
                          >
                            {formatPrice(Number(plan.precio))}
                          </span>
                          <span className="text-gray-600 text-lg ml-2">
                            / {plan.duracionDias} días
                          </span>
                        </div>

                        {/* Descripción */}
                        {plan.descripcion && (
                          <p className="text-gray-600 min-h-[48px] leading-relaxed">
                            {plan.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {[
                          'Acceso ilimitado al gimnasio',
                          'Entrenadores certificados',
                          'Equipamiento moderno',
                          'Clases grupales incluidas',
                          'Asesoría nutricional',
                          'Vestuarios y duchas',
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: `${colorPrimario}20` }}
                            >
                              <CheckCircle 
                                className="w-4 h-4"
                                style={{ color: colorPrimario }}
                              />
                            </div>
                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link
                        to="/contacto"
                        className={`block w-full text-center px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${
                          isDestacado
                            ? 'text-white'
                            : 'border-2 hover:text-white'
                        }`}
                        style={
                          isDestacado
                            ? { 
                                background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                              }
                            : { 
                                borderColor: colorPrimario,
                                color: colorPrimario,
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!isDestacado) {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDestacado) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {isDestacado ? (
                          <span className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Comenzar Ahora
                          </span>
                        ) : (
                          'Elegir Plan'
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA Final */}
          <div className="mt-20 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                ¿No estás seguro cuál plan elegir?
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                Contáctanos y te ayudaremos a encontrar el plan perfecto para tus objetivos
              </p>
              <Link
                to="/contacto"
                className="inline-block px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                }}
              >
                Hablar con un Asesor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
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
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </PublicLayout>
  );
}