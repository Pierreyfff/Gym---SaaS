import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api/client';
import type { PublicConfiguracion } from '@gym-saas/api-client';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

export function PublicFooter() {
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await apiClient.public.getConfiguracion();
      setConfig(data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, any> = {
      facebook: FacebookIcon,
      instagram: InstagramIcon,
      whatsapp: WhatsAppIcon,
      tiktok: TikTokIcon,
    };
    return icons[platform] || null;
  };

  const socialLinks = [
    { platform: 'facebook', url: config?.facebook, color: '#1877F2' },
    { platform: 'instagram', url: config?.instagram, color: '#E4405F' },
    { 
      platform: 'whatsapp', 
      url: config?.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : null,
      color: '#25D366'
    },
    { platform: 'tiktok', url: config?.tiktok, color: '#000000' },
  ].filter((link) => link.url);

  const colorPrimario = config?.colorPrimario || '#10b981';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Columna 1: Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: colorPrimario }}>
              {config?.nombreNegocio || 'GymSaaS'}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed mb-6">
              {config?.descripcionCorta || 'El mejor gimnasio de la ciudad con entrenadores certificados'}
            </p>
            
            {/* Redes Sociales */}
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return Icon ? (
                  <a
                    key={link.platform}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                    style={{ 
                      backgroundColor: `${link.color}20`,
                      color: link.color,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = link.color;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${link.color}20`;
                      e.currentTarget.style.color = link.color;
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-6">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/home" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/nosotros" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  to="/planes-publicos" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Planes
                </Link>
              </li>
              <li>
                <Link 
                  to="/tienda" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Tienda
                </Link>
              </li>
              <li>
                <Link 
                  to="/galeria-publica" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Galería
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Horarios */}
          <div>
            <h3 className="text-lg font-bold mb-6">Horarios</h3>
            {config?.horarioApertura && config?.horarioCierre ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">Lunes a Sábado</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">{config.horarioApertura} - {config.horarioCierre}</p>
                  </div>
                </div>
                {!config.diasLaborales.includes('domingo') && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">Domingo</p>
                      <p className="text-red-400 text-sm">Cerrado</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">Consulta nuestros horarios</p>
            )}
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contacto</h3>
            <div className="space-y-4">
              {config?.direccion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{config.direccion}</p>
                </div>
              )}
              {config?.telefono && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <a 
                    href={`tel:${config.telefono}`}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm"
                  >
                    {config.telefono}
                  </a>
                </div>
              )}
              {config?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <a 
                    href={`mailto:${config.email}`}
                    className="text-gray-400 dark:text-gray-500 hover:text-white transition text-sm"
                  >
                    {config.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {config?.nombreNegocio || 'GymSaaS'}. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/terminos" className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}