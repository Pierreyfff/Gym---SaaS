import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Definir tipos localmente (ya no los importamos de shared)
interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  estado: 'activo' | 'inactivo';
  gimnasioId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken:  string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  
  // Getters
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      getAccessToken: () => get().accessToken,
      
      getRefreshToken: () => get().refreshToken,

      isAdmin: () => get().user?.rol === 'admin',

      isStaff: () => {
        const rol = get().user?.rol;
        return rol === 'admin' || rol === 'recepcionista';
      },
    }),
    {
      name: 'gym-saas-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);