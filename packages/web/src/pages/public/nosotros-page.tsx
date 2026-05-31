import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import type { PublicConfiguracion, PublicStaff, PublicTestimonio } from '@gym-saas/api-client';
import { Star, Instagram, Facebook } from 'lucide-react';

export function NosotrosPage() {
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [staff, setStaff] = useState<PublicStaff[]>([]);
  const [testimonios, setTestimonios] = useState<PublicTestimonio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, staffData, testimoniosData] = await Promise.all([
        apiClient.public.getConfiguracion(),
        apiClient.public.getStaff(),
        apiClient.public.getTestimonios(),
      ]);

      setConfig(configData);
      setStaff(staffData.staff.sort((a, b) => a.orden - b.orden));
      setTestimonios(testimoniosData.testimonios.sort((a, b) => a.orden - b.orden));
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
              index < calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
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
          <h1 className="text-6xl font-bold mb-6 animate-fade-in-up">Sobre Nosotros</h1>
          <p className="text-2xl max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {config?.descripcionCorta || 'Conoce más sobre nuestro gimnasio'}
          </p>
        </div>
      </section>

      {/* Descripción Larga */}
      {config?.descripcionLarga && (
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center" style={{ color: colorPrimario }}>
              Nuestra Historia
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
              {config.descripcionLarga.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-6 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Misión y Visión */}
      {config?.misionVision && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center" style={{ color: colorPrimario }}>
              Misión y Visión
            </h2>
            <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                {config.misionVision.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-6">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Staff con fotos circulares */}
      {staff.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center" style={{ color: colorPrimario }}>
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-16">
              Profesionales dedicados a tu transformación
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {staff.map((member, index) => (
                <div 
                  key={member.id} 
                  className="text-center group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Foto con marco circular */}
                  <div className="relative inline-block mb-6">
                    <div
                      className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                        transform: 'scale(1.1)',
                      }}
                    />
                    <div
                      className="relative w-48 h-48 rounded-full p-1"
                      style={{ 
                        background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                      }}
                    >
                      <img
                        src={member.imagenUrl || `https://ui-avatars.com/api/?name=${member.nombre}+${member.apellido}&background=random&size=400`}
                        alt={`${member.nombre} ${member.apellido}`}
                        className="w-full h-full rounded-full object-cover ring-4 ring-white"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.nombre}+${member.apellido}&background=random&size=400`;
                        }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {member.nombre} {member.apellido}
                  </h3>
                  <p 
                    className="font-semibold text-lg mb-3"
                    style={{ color: colorPrimario }}
                  >
                    {member.cargo}
                  </p>
                  
                  {member.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 px-4">
                      {member.descripcion}
                    </p>
                  )}

                  {/* Redes sociales */}
                  <div className="flex justify-center gap-3">
                    {member.instagram && (
                      <a
                        href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonios */}
      {testimonios.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center" style={{ color: colorPrimario }}>
              Testimonios de Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-16">
              Historias reales de transformación
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonios.map((testimonio, index) => (
                <div 
                  key={testimonio.id} 
                  className="bg-white dark:bg-gray-950 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    {testimonio.imagenUrl ? (
                      <img
                        src={testimonio.imagenUrl}
                        alt={testimonio.nombreCliente}
                        className="w-16 h-16 rounded-full object-cover"
                        style={{ boxShadow: `0 0 0 3px ${colorPrimario}40` }}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonio.nombreCliente}&background=random`;
                        }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${colorPrimario}20` }}
                      >
                        <span className="text-2xl font-bold" style={{ color: colorPrimario }}>
                          {testimonio.nombreCliente.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{testimonio.nombreCliente}</h4>
                      {renderStars(testimonio.calificacion)}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{testimonio.contenido}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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