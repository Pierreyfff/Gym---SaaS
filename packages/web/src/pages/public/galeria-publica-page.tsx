import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { X, ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { PublicConfiguracion } from '@gym-saas/api-client';

interface PublicImagen {
  id: string;
  url: string;
  titulo?: string;
  descripcion?: string;
  orden: number;
}

export function GaleriaPublicaPage() {
  const [imagenes, setImagenes] = useState<PublicImagen[]>([]);
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [galeriaData, configData] = await Promise.all([
        apiClient.public.getGaleria(),
        apiClient.public.getConfiguracion(),
      ]);
      setImagenes(galeriaData.imagenes);
      setConfig(configData);
    } catch (error) {
      console.error('Error cargando galería:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, imagenes.length]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600">Cargando galería...</div>
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
          <h1 className="text-6xl font-bold mb-6">Galería</h1>
          <p className="text-2xl max-w-3xl mx-auto">
            Nuestras instalaciones y ambiente
          </p>
        </div>
      </section>

      {/* Galería */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {imagenes.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-xl font-medium mb-2">
                No hay imágenes disponibles
              </p>
              <p className="text-gray-500">
                Pronto agregaremos fotos de nuestras instalaciones
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imagenes.map((imagen, index) => (
                <div
                  key={imagen.id}
                  className="group relative aspect-square bg-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={imagen.url}
                    alt={imagen.titulo || 'Imagen de galería'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400?text=Imagen+No+Disponible';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Título */}
                  {imagen.titulo && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-white font-bold text-lg">{imagen.titulo}</h3>
                      {imagen.descripcion && (
                        <p className="text-white text-sm opacity-90 line-clamp-2 mt-1">
                          {imagen.descripcion}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && imagenes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Botón Cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition z-10"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Imagen */}
          <div className="relative max-w-6xl w-full">
            <img
              src={imagenes[currentImageIndex].url}
              alt={imagenes[currentImageIndex].titulo || 'Imagen'}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800?text=Error+al+cargar+imagen';
              }}
            />

            {/* Info */}
            {(imagenes[currentImageIndex].titulo || imagenes[currentImageIndex].descripcion) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent rounded-b-lg">
                {imagenes[currentImageIndex].titulo && (
                  <h3 className="text-white font-bold text-2xl mb-2">
                    {imagenes[currentImageIndex].titulo}
                  </h3>
                )}
                {imagenes[currentImageIndex].descripcion && (
                  <p className="text-white text-lg">
                    {imagenes[currentImageIndex].descripcion}
                  </p>
                )}
              </div>
            )}

            {/* Navegación */}
            {imagenes.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Contador */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {currentImageIndex + 1} / {imagenes.length}
            </div>
          </div>
        </div>
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </PublicLayout>
  );
}