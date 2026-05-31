import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Building2,
  Clock,
  Phone,
  Share2,
  FileText,
  Bell,
  Image as ImageIcon,
  MapPin,
  Trash2,
  Plus,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracionFormData {
  nombreNegocio: string;
  logoUrl: string;
  colorPrimario: string;
  colorSecundario: string;
  horarioApertura: string;
  horarioCierre: string;
  diasLaborales: string[];
  telefono: string;
  email: string;
  direccion: string;
  sitioweb: string;
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  youtube: string;
  tiktok: string;
  imagenHero: string;
  imagenesCarrusel: string[];
  descripcionCorta: string;
  descripcionLarga: string;
  misionVision: string;
  mapaLatitud: string;
  mapaLongitud: string;
  politicaCancelacion: string;
  terminosCondiciones: string;
  notificarVencimiento7Dias: boolean;
  notificarVencimiento3Dias: boolean;
  notificarVencimiento1Dia: boolean;
  notificarBienvenida: boolean;
  notificarRenovacion: boolean;
}

const diasSemana = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

type TabType =
  | 'basico'
  | 'horarios'
  | 'contacto'
  | 'redes'
  | 'imagenes'
  | 'textos'
  | 'ubicacion'
  | 'politicas'
  | 'notificaciones';

export function ConfiguracionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('basico');
  const [formData, setFormData] = useState<ConfiguracionFormData>({
    nombreNegocio: '',
    logoUrl: '',
    colorPrimario: '#10b981',
    colorSecundario: '#3b82f6',
    horarioApertura: '',
    horarioCierre: '',
    diasLaborales: [
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ],
    telefono: '',
    email: '',
    direccion: '',
    sitioweb: '',
    facebook: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    youtube: '',
    tiktok: '',
    imagenHero: '',
    imagenesCarrusel: [],
    descripcionCorta: '',
    descripcionLarga: '',
    misionVision: '',
    mapaLatitud: '',
    mapaLongitud: '',
    politicaCancelacion: '',
    terminosCondiciones: '',
    notificarVencimiento7Dias: true,
    notificarVencimiento3Dias: true,
    notificarVencimiento1Dia: true,
    notificarBienvenida: true,
    notificarRenovacion: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImagenCarrusel, setNewImagenCarrusel] = useState('');

  useEffect(() => {
    loadConfiguracion();
  }, []);

  const loadConfiguracion = async () => {
    try {
      setLoading(true);
      const config = await apiClient.configuracion.getConfiguracion();

      setFormData({
        nombreNegocio: config.nombreNegocio || '',
        logoUrl: config.logoUrl || '',
        colorPrimario: config.colorPrimario,
        colorSecundario: config.colorSecundario,
        horarioApertura: config.horarioApertura || '',
        horarioCierre: config.horarioCierre || '',
        diasLaborales: config.diasLaborales,
        telefono: config.telefono || '',
        email: config.email || '',
        direccion: config.direccion || '',
        sitioweb: config.sitioweb || '',
        facebook: config.facebook || '',
        instagram: config.instagram || '',
        twitter: config.twitter || '',
        whatsapp: config.whatsapp || '',
        youtube: config.youtube || '',
        tiktok: config.tiktok || '',
        imagenHero: config.imagenHero || '',
        imagenesCarrusel: config.imagenesCarrusel || [],
        descripcionCorta: config.descripcionCorta || '',
        descripcionLarga: config.descripcionLarga || '',
        misionVision: config.misionVision || '',
        mapaLatitud: config.mapaLatitud || '',
        mapaLongitud: config.mapaLongitud || '',
        politicaCancelacion: config.politicaCancelacion || '',
        terminosCondiciones: config.terminosCondiciones || '',
        notificarVencimiento7Dias: config.notificarVencimiento7Dias,
        notificarVencimiento3Dias: config.notificarVencimiento3Dias,
        notificarVencimiento1Dia: config.notificarVencimiento1Dia,
        notificarBienvenida: config.notificarBienvenida,
        notificarRenovacion: config.notificarRenovacion,
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      await apiClient.configuracion.updateConfiguracion({
        ...formData,
        nombreNegocio: formData.nombreNegocio || undefined,
        logoUrl: formData.logoUrl || undefined,
        horarioApertura: formData.horarioApertura || undefined,
        horarioCierre: formData.horarioCierre || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        sitioweb: formData.sitioweb || undefined,
        facebook: formData.facebook || undefined,
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        whatsapp: formData.whatsapp || undefined,
        youtube: formData.youtube || undefined,
        tiktok: formData.tiktok || undefined,
        imagenHero: formData.imagenHero || undefined,
        descripcionCorta: formData.descripcionCorta || undefined,
        descripcionLarga: formData.descripcionLarga || undefined,
        misionVision: formData.misionVision || undefined,
        mapaLatitud: formData.mapaLatitud || undefined,
        mapaLongitud: formData.mapaLongitud || undefined,
        politicaCancelacion: formData.politicaCancelacion || undefined,
        terminosCondiciones: formData.terminosCondiciones || undefined,
      });

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios han sido guardados exitosamente',
      });
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDiaToggle = (dia: string) => {
    setFormData((prev) => ({
      ...prev,
      diasLaborales: prev.diasLaborales.includes(dia)
        ? prev.diasLaborales.filter((d) => d !== dia)
        : [...prev.diasLaborales, dia],
    }));
  };

  const handleAddImagenCarrusel = () => {
    if (!newImagenCarrusel.trim()) {
      toast({
        title: 'Error',
        description: 'Ingresa una URL válida',
        variant: 'destructive',
      });
      return;
    }

    if (formData.imagenesCarrusel.length >= 4) {
      toast({
        title: 'Límite alcanzado',
        description: 'Máximo 4 imágenes en el carrusel',
        variant: 'destructive',
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      imagenesCarrusel: [...prev.imagenesCarrusel, newImagenCarrusel],
    }));
    setNewImagenCarrusel('');
  };

  const handleRemoveImagenCarrusel = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagenesCarrusel: prev.imagenesCarrusel.filter((_, i) => i !== index),
    }));
  };

  const tabs = [
    { id: 'basico', label: 'Básico', icon: Building2 },
    { id: 'horarios', label: 'Horarios', icon: Clock },
    { id: 'contacto', label: 'Contacto', icon: Phone },
    { id: 'redes', label: 'Redes Sociales', icon: Share2 },
    { id: 'imagenes', label: 'Imágenes', icon: ImageIcon },
    { id: 'textos', label: 'Textos', icon: FileText },
    { id: 'ubicacion', label: 'Ubicación', icon: MapPin },
    { id: 'politicas', label: 'Políticas', icon: FileText },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Configuración del Gimnasio
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow mb-6 overflow-x-auto">
          <div className="flex border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-600 text-green-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB: Información Básica */}
          {activeTab === 'basico' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Información Básica
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="nombreNegocio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nombre del Gimnasio
                  </label>
                  <input
                    type="text"
                    id="nombreNegocio"
                    name="nombreNegocio"
                    value={formData.nombreNegocio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Gimnasio PowerFit"
                  />
                </div>

                <div>
                  <label
                    htmlFor="logoUrl"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    URL del Logo
                  </label>
                  <input
                    type="text"
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>

                <div>
                  <label
                    htmlFor="colorPrimario"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Color Primario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="colorPrimario"
                      name="colorPrimario"
                      value={formData.colorPrimario}
                      onChange={handleChange}
                      className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorPrimario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colorPrimario: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="colorSecundario"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Color Secundario
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="colorSecundario"
                      name="colorSecundario"
                      value={formData.colorSecundario}
                      onChange={handleChange}
                      className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.colorSecundario}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colorSecundario: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Horarios */}
          {activeTab === 'horarios' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Horarios
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="horarioApertura"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Apertura
                  </label>
                  <input
                    type="time"
                    id="horarioApertura"
                    name="horarioApertura"
                    value={formData.horarioApertura}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="horarioCierre"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Hora de Cierre
                  </label>
                  <input
                    type="time"
                    id="horarioCierre"
                    name="horarioCierre"
                    value={formData.horarioCierre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Días Laborales
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {diasSemana.map((dia) => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => handleDiaToggle(dia.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        formData.diasLaborales.includes(dia.value)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Contacto */}
          {activeTab === 'contacto' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Información de Contacto
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="info@gimnasio.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Calle Principal #123, Ciudad"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="sitioweb"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    id="sitioweb"
                    name="sitioweb"
                    value={formData.sitioweb}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://www.gimnasio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Redes Sociales */}
          {activeTab === 'redes' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Share2 className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Redes Sociales
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="facebook"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Facebook
                  </label>
                  <input
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://facebook.com/gimnasio"
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="@gimnasio"
                  />
                </div>

                <div>
                  <label
                    htmlFor="twitter"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Twitter / X
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="@gimnasio"
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsapp"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="youtube"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    YouTube
                  </label>
                  <input
                    type="text"
                    id="youtube"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://youtube.com/@gimnasio"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tiktok"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    TikTok
                  </label>
                  <input
                    type="text"
                    id="tiktok"
                    name="tiktok"
                    value={formData.tiktok}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="@gimnasio"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Imágenes */}
          {activeTab === 'imagenes' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <ImageIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Imágenes de la Web
                </h2>
              </div>

              <div className="space-y-6">
                {/* Imagen Hero */}
                <div>
                  <label
                    htmlFor="imagenHero"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Imagen Principal (Hero)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Esta imagen se mostrará en la parte superior de la página de
                    inicio
                  </p>
                  <input
                    type="text"
                    id="imagenHero"
                    name="imagenHero"
                    value={formData.imagenHero}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://ejemplo.com/hero.jpg"
                  />
                  {formData.imagenHero && (
                    <div className="mt-2">
                      <img
                        src={formData.imagenHero}
                        alt="Hero preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/800x400?text=Error+cargando+imagen';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Carrusel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carrusel de Imágenes (Máximo 4)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Estas imágenes rotarán automáticamente en el inicio de la
                    página web
                  </p>

                  {/* Lista de imágenes */}
                  <div className="space-y-2 mb-4">
                    {formData.imagenesCarrusel.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <img
                          src={url}
                          alt={`Carrusel ${index + 1}`}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/100?text=Error';
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {url}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Imagen {index + 1}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImagenCarrusel(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Agregar nueva imagen */}
                  {formData.imagenesCarrusel.length < 4 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newImagenCarrusel}
                        onChange={(e) => setNewImagenCarrusel(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      <button
                        type="button"
                        onClick={handleAddImagenCarrusel}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Plus className="w-5 h-5" />
                        Agregar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Textos */}
          {activeTab === 'textos' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Textos de la Web
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="descripcionCorta"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Descripción Corta
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Se mostrará en la sección hero y meta description (máx. 160
                    caracteres)
                  </p>
                  <textarea
                    id="descripcionCorta"
                    name="descripcionCorta"
                    value={formData.descripcionCorta}
                    onChange={handleChange}
                    rows={2}
                    maxLength={160}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="El mejor gimnasio de la ciudad..."
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formData.descripcionCorta.length}/160 caracteres
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="descripcionLarga"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Descripción Larga (Nosotros)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Descripción completa del gimnasio para la página "Nosotros"
                  </p>
                  <textarea
                    id="descripcionLarga"
                    name="descripcionLarga"
                    value={formData.descripcionLarga}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Somos un gimnasio fundado en..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="misionVision"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Misión y Visión
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Describe la misión y visión de tu gimnasio
                  </p>
                  <textarea
                    id="misionVision"
                    name="misionVision"
                    value={formData.misionVision}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Misión: Transformar vidas...&#10;Visión: Ser el gimnasio líder..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Ubicación */}
          {activeTab === 'ubicacion' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Ubicación (Google Maps)
                </h2>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    ¿Cómo obtener las coordenadas?
                  </p>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Abre Google Maps</li>
                    <li>Busca tu gimnasio</li>
                    <li>Click derecho en el marcador</li>
                    <li>Copia las coordenadas (Ej: -12.046373, -77.042755)</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="mapaLatitud"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Latitud
                    </label>
                    <input
                      type="text"
                      id="mapaLatitud"
                      name="mapaLatitud"
                      value={formData.mapaLatitud}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="-12.046373"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mapaLongitud"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Longitud
                    </label>
                    <input
                      type="text"
                      id="mapaLongitud"
                      name="mapaLongitud"
                      value={formData.mapaLongitud}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="-77.042755"
                    />
                  </div>
                </div>

                {formData.mapaLatitud && formData.mapaLongitud && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vista previa:
                    </p>
                    <iframe
                      src={`https://www.google.com/maps?q=${formData.mapaLatitud},${formData.mapaLongitud}&output=embed`}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Políticas */}
          {activeTab === 'politicas' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Políticas y Términos
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="politicaCancelacion"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Política de Cancelación
                  </label>
                  <textarea
                    id="politicaCancelacion"
                    name="politicaCancelacion"
                    value={formData.politicaCancelacion}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Describe tu política de cancelación..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="terminosCondiciones"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Términos y Condiciones
                  </label>
                  <textarea
                    id="terminosCondiciones"
                    name="terminosCondiciones"
                    value={formData.terminosCondiciones}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Describe tus términos y condiciones..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Notificaciones por Email
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificarBienvenida"
                    checked={formData.notificarBienvenida}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Email de Bienvenida
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enviar email cuando se crea un nuevo cliente
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificarRenovacion"
                    checked={formData.notificarRenovacion}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Confirmación de Renovación
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enviar email cuando se renueva una membresía
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificarVencimiento7Dias"
                    checked={formData.notificarVencimiento7Dias}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Alerta 7 días antes del vencimiento
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar cuando falten 7 días para que venza la membresía
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificarVencimiento3Dias"
                    checked={formData.notificarVencimiento3Dias}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Alerta 3 días antes del vencimiento
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar cuando falten 3 días para que venza la membresía
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="notificarVencimiento1Dia"
                    checked={formData.notificarVencimiento1Dia}
                    onChange={handleChange}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Alerta 1 día antes del vencimiento
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Notificar cuando falte 1 día para que venza la membresía
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 sticky bottom-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 shadow-lg"
              disabled={saving}
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
