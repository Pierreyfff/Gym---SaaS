import { useEffect, useState } from 'react';
import { PublicLayout } from '@/components/layouts/public-layout';
import { apiClient } from '@/lib/api/client';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import type { PublicConfiguracion } from '@gym-saas/api-client';

export function ContactoPage() {
  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await apiClient.public.getConfiguracion();
      setConfig(data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulación de envío (aquí conectarías con tu backend o servicio de email)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSent(true);
    setSending(false);

    // Reset form después de 3 segundos
    setTimeout(() => {
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setSent(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          <h1 className="text-6xl font-bold mb-6">Contáctanos</h1>
          <p className="text-2xl max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Escríbenos o visítanos
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Columna Izquierda: Información */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8" style={{ color: colorPrimario }}>
                  Información de Contacto
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                  Visítanos, llámanos o escríbenos. Estaremos encantados de atenderte.
                </p>
              </div>

              {/* Cards de contacto */}
              <div className="space-y-6">
                {config?.telefono && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                        }}
                      >
                        <Phone className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">Teléfono</h3>
                        <a
                          href={`tel:${config.telefono}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition text-lg"
                        >
                          {config.telefono}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {config?.email && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${colorSecundario}, ${colorPrimario})`,
                        }}
                      >
                        <Mail className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">Email</h3>
                        <a
                          href={`mailto:${config.email}`}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition text-lg break-all"
                        >
                          {config.email}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {config?.direccion && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                        }}
                      >
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">Dirección</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">{config.direccion}</p>
                      </div>
                    </div>
                  </div>
                )}

                {config?.horarioApertura && config?.horarioCierre && (
                  <div className="bg-white dark:bg-gray-950 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${colorSecundario}, ${colorPrimario})`,
                        }}
                      >
                        <Clock className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 text-lg">Horarios</h3>
                        <div className="space-y-1">
                          <p className="text-gray-600 dark:text-gray-400 text-lg">
                            <span className="font-semibold">Lunes a Sábado:</span>
                            <br />
                            {config.horarioApertura} - {config.horarioCierre}
                          </p>
                          {!config.diasLaborales.includes('domingo') && (
                            <p className="text-red-600 font-semibold">Domingos: Cerrado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mapa */}
              {config?.mapaLatitud && config?.mapaLongitud && (
                <div className="mt-8">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-2xl">Encuéntranos</h3>
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                      src={`https://www.google.com/maps?q=${config.mapaLatitud},${config.mapaLongitud}&output=embed`}
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Formulario */}
            <div>
              <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-8 lg:p-10 sticky top-24">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ color: colorPrimario }}>
                  Envíanos un Mensaje
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Completa el formulario y nos pondremos en contacto contigo pronto
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent transition"
                      style={{ 
                        '--tw-ring-color': colorPrimario,
                      } as React.CSSProperties}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent transition"
                      style={{ 
                        '--tw-ring-color': colorPrimario,
                      } as React.CSSProperties}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent transition"
                      style={{ 
                        '--tw-ring-color': colorPrimario,
                      } as React.CSSProperties}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:border-transparent resize-none transition"
                      style={{ 
                        '--tw-ring-color': colorPrimario,
                      } as React.CSSProperties}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || sent}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform ${
                      sent ? 'scale-95' : 'hover:scale-105'
                    } shadow-xl disabled:opacity-50`}
                    style={{
                      background: sent 
                        ? '#10b981' 
                        : `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                    }}
                  >
                    {sent ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        ¡Mensaje Enviado!
                      </>
                    ) : sending ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}