import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
import type { PublicConfiguracion } from '@gym-saas/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { toast } = useToast();

  const [config, setConfig] = useState<PublicConfiguracion | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');

  useEffect(() => {
    apiClient.public.getConfiguracion()
      .then(setConfig)
      .catch(() => {});

    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor completa todos los campos',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.auth.login({ email, password });

      setAuth(response.user, response.accessToken, response.refreshToken);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast({
        title: 'Bienvenido',
        description: `Hola ${response.user.nombre}`,
      });

      if (returnUrl) {
        navigate(returnUrl);
      } else {
        switch (response.user.rol) {
          case 'cliente':
            navigate('/cliente/dashboard');
            break;
          case 'recepcionista':
            navigate('/recepcionista/dashboard');
            break;
          case 'entrenador':
            navigate('/entrenador/dashboard');
            break;
          case 'admin':
            navigate('/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: error.response?.data?.message || 'Credenciales inválidas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recoveryEmail) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor ingresa tu email',
      });
      return;
    }

    setIsRecoveryLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'Email enviado',
      description: 'Si la cuenta existe, recibirás un enlace de recuperación',
    });

    setIsRecoveryLoading(false);
    setShowRecovery(false);
  };

  const primario = config?.colorPrimario || '#dc2626';
  const secundario = config?.colorSecundario || '#7f1d1d';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, #09090b 0%, ${primario}18 50%, ${secundario}18 100%)`,
      }}
    >
      <Card className="w-full max-w-md transition-all duration-300">
        <CardHeader className="space-y-1">
          {config?.logoUrl && (
            <div className="flex justify-center mb-2">
              <img
                src={config.logoUrl}
                alt={config.nombreNegocio || 'Logo'}
                className="h-20 w-20 object-contain rounded-full ring-2 ring-background shadow-lg"
              />
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-center">
            {config?.nombreNegocio || 'Gym SaaS'}
          </CardTitle>
          <CardDescription className="text-center">
            {showRecovery
              ? 'Recupera tu contraseña'
              : returnUrl === '/checkout'
                ? 'Inicia sesión para completar tu compra'
                : 'Ingresa tus credenciales para acceder'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`transition-all duration-300 ${showRecovery ? 'animate-in fade-in slide-in-from-right-4' : ''}`}>
            {showRecovery ? (
              <form onSubmit={handleRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      disabled={isRecoveryLoading}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isRecoveryLoading}>
                  {isRecoveryLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {isRecoveryLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver al inicio de sesión
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@gymdemo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <span className="text-sm text-muted-foreground">Recordarme</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRecovery(true);
                      setRecoveryEmail(email);
                    }}
                    className="text-sm text-primary hover:underline transition-all"
                  >
                    Olvidaste tu contraseña?
                  </button>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
        {!showRecovery && (
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              No tienes cuenta?{' '}
              <Link
                to={returnUrl ? `/registro?returnUrl=${returnUrl}` : '/registro'}
                className="text-primary hover:underline font-semibold transition-all"
              >
                Registrate aqui
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
