import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';
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

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Obtener returnUrl del query string
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');

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

      // Guardar en store
      setAuth(response.user, response.accessToken, response.refreshToken);

      toast({
        title: 'Bienvenido',
        description: `Hola ${response.user.nombre}`,
      });

      // Redirigir según returnUrl o rol
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
        title: 'Error al iniciar sesion',
        description: error.response?.data?.message || 'Credenciales invalidas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Gym SaaS
          </CardTitle>
          <CardDescription className="text-center">
            {returnUrl === '/checkout' 
              ? 'Inicia sesion para completar tu compra'
              : 'Ingresa tus credenciales para acceder'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gymdemo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Iniciando sesion...' : 'Iniciar sesion'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              to={returnUrl ? `/registro?returnUrl=${returnUrl}` : '/registro'}
              className="text-primary hover:underline font-semibold"
            >
              Registrate aqui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}