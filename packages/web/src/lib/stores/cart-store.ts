import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './auth-store';

export interface ProductoItem {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  stock: number;
  categoriaNombre?: string;
}

export interface CartItem {
  producto: ProductoItem;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  wishlist: string[];
  lastUserId: string | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;

  addToCart: (producto: ProductoItem) => void;
  removeFromCart: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  toggleWishlist: (productoId: string) => void;
  isInWishlist: (productoId: string) => boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;

  totalItems: number;
  totalPrice: number;
  wishlistCount: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      lastUserId: null,
      isCartOpen: false,
      isWishlistOpen: false,
      totalItems: 0,
      totalPrice: 0,
      wishlistCount: 0,

      addToCart: (producto) => {
        const { items } = get();
        const existing = items.find(
          (item) => item.producto.id === producto.id,
        );

        let newItems: CartItem[];
        if (existing) {
          newItems = items.map((item) =>
            item.producto.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item,
          );
        } else {
          newItems = [...items, { producto, cantidad: 1 }];
        }

        set({
          items: newItems,
          totalItems: newItems.reduce((sum, i) => sum + i.cantidad, 0),
          totalPrice: newItems.reduce(
            (sum, i) => sum + Number(i.producto.precio) * i.cantidad,
            0,
          ),
          wishlistCount: get().wishlist.length,
          isCartOpen: true,
        });
      },

      removeFromCart: (productoId) => {
        const newItems = get().items.filter(
          (item) => item.producto.id !== productoId,
        );
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, i) => sum + i.cantidad, 0),
          totalPrice: newItems.reduce(
            (sum, i) => sum + Number(i.producto.precio) * i.cantidad,
            0,
          ),
        });
      },

      updateQuantity: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().removeFromCart(productoId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.producto.id === productoId ? { ...item, cantidad } : item,
        );
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, i) => sum + i.cantidad, 0),
          totalPrice: newItems.reduce(
            (sum, i) => sum + Number(i.producto.precio) * i.cantidad,
            0,
          ),
        });
      },

      clearCart: () => {
        set({ items: [], wishlist: [], totalItems: 0, totalPrice: 0, wishlistCount: 0 });
      },

      toggleWishlist: (productoId) => {
        const { wishlist } = get();
        let newWishlist: string[];
        if (wishlist.includes(productoId)) {
          newWishlist = wishlist.filter((id) => id !== productoId);
        } else {
          newWishlist = [...wishlist, productoId];
        }
        set({ wishlist: newWishlist, wishlistCount: newWishlist.length });
      },

      isInWishlist: (productoId) => {
        return get().wishlist.includes(productoId);
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open });
      },

      setWishlistOpen: (open) => {
        set({ isWishlistOpen: open });
      },
    }),
    {
      name: 'gym-saas-cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

const currentUserId = () => useAuthStore.getState().user?.id ?? null;

let prevUserId = currentUserId();
useAuthStore.subscribe(() => {
  const newUserId = currentUserId();
  if (newUserId !== prevUserId) {
    prevUserId = newUserId;
    useCartStore.getState().clearCart();
  }
});
