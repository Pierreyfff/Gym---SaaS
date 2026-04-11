import { Facebook, Instagram, Twitter, Youtube, MessageCircle, Music, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api/client';
import type { PublicConfiguracion } from '@gym-saas/api-client';

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
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      youtube: Youtube,
      whatsapp: MessageCircle,
      tiktok: Music,
    };
    return icons[platform] || null;
  };

  const socialLinks = [
    { platform: 'facebook', url: config?.facebook, color: '#1877F2' },
    { platform: 'instagram', url: config?.instagram, color: '#E4405F' },
    { platform: 'twitter', url: config?.twitter, color: '#1DA1F2' },
    { platform: 'youtube', url: config?.youtube, color: '#FF0000' },
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
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
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
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/nosotros" 
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Nosotros
                </Link>
              </li>
              <li>
                <Link 
                  to="/planes-publicos" 
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Planes
                </Link>
              </li>
              <li>
                <Link 
                  to="/tienda" 
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Tienda
                </Link>
              </li>
              <li>
                <Link 
                  to="/galeria-publica" 
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorPrimario }} />
                  Galería
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="text-gray-400 hover:text-white transition text-sm flex items-center gap-2"
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
                    <p className="text-gray-400 text-sm">{config.horarioApertura} - {config.horarioCierre}</p>
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
              <p className="text-gray-400 text-sm">Consulta nuestros horarios</p>
            )}
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contacto</h3>
            <div className="space-y-4">
              {config?.direccion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <p className="text-gray-400 text-sm">{config.direccion}</p>
                </div>
              )}
              {config?.telefono && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colorPrimario }} />
                  <a 
                    href={`tel:${config.telefono}`}
                    className="text-gray-400 hover:text-white transition text-sm"
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
                    className="text-gray-400 hover:text-white transition text-sm"
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
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {config?.nombreNegocio || 'GymSaaS'}. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/terminos" className="text-gray-400 hover:text-white text-sm transition">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-gray-400 hover:text-white text-sm transition">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}