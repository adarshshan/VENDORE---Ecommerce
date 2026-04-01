import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/User";
import type { CartItem } from "../types/Cart";
import type { Product } from "../types/Product";
import * as api from "../services/api";

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  logout: () => void;
  
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string | number, size?: string, color?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;

  wishlist: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string | number) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isModalOpen: false,
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
      logout: () => {
        set({ user: null, cart: [], wishlist: [] });
        localStorage.removeItem("user");
      },

      cart: [],
      addToCart: (product, quantity = 1, size, color) => {
        const currentCart = get().cart;
        
        // Stock check
        const existingItem = currentCart.find(
          (item) => item._id === product._id && item.selectedSize === size && item.selectedColor === color
        );
        const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
        const totalRequestedQuantity = currentQuantityInCart + quantity;

        if (product.hasSizes) {
          const sizeObj = product.sizes?.find(s => s.size === size);
          if (!sizeObj || totalRequestedQuantity > sizeObj.stock) {
            console.warn("Cannot add more than available stock for this size");
            return;
          }
        } else if (product.stock !== undefined && totalRequestedQuantity > product.stock) {
          console.warn("Cannot add more than available global stock");
          return;
        }

        if (existingItem) {
          const newCart = [...currentCart];
          const index = currentCart.indexOf(existingItem);
          newCart[index] = {
            ...newCart[index],
            quantity: totalRequestedQuantity
          };
          set({ cart: newCart });
        } else {
          set({
            cart: [...currentCart, { ...product, quantity, selectedSize: size, selectedColor: color } as CartItem],
          });
        }
      },
      removeFromCart: (productId, size, color) =>
        set({ 
          cart: get().cart.filter((item) => 
            !(item._id === productId && item.selectedSize === size && item.selectedColor === color)
          ) 
        }),
      updateQuantity: (productId, quantity, size, color) => {
        const item = get().cart.find(i => i._id === productId && i.selectedSize === size && i.selectedColor === color);
        if (!item) return;

        if (item.hasSizes) {
          const sizeObj = item.sizes?.find(s => s.size === size);
          if (!sizeObj || quantity > sizeObj.stock) return;
        } else if (item.stock !== undefined && quantity > item.stock) {
          return;
        }

        set({
          cart: get().cart.map((item) =>
            item._id === productId && item.selectedSize === size && item.selectedColor === color 
              ? { ...item, quantity } 
              : item
          ),
        });
      },
      clearCart: () => set({ cart: [] }),

      wishlist: [],
      fetchWishlist: async () => {
        if (!get().user) return;
        try {
          const { wishlist } = await api.getWishlist();
          set({ wishlist });
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      },
      addToWishlist: async (product) => {
        const currentWishlist = get().wishlist;
        if (!currentWishlist.find((item) => item._id === product._id)) {
          if (get().user) {
            try {
              const { wishlist } = await api.addToWishlist(product._id as string);
              set({ wishlist });
            } catch (error) {
              console.error("Error adding to wishlist:", error);
            }
          } else {
            set({ wishlist: [...currentWishlist, product] });
          }
        }
      },
      removeFromWishlist: async (productId) => {
        if (get().user) {
          try {
            const { wishlist } = await api.removeFromWishlist(
              productId as string,
            );
            set({ wishlist });
          } catch (error) {
            console.error("Error removing from wishlist:", error);
          }
        } else {
          set({
            wishlist: get().wishlist.filter((item) => item._id !== productId),
          });
        }
      },

      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (theme === "light") {
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "kids-own-storage",
      onRehydrateStorage: (state) => {
        return () => {
          state?.setHasHydrated(true);
          // Apply theme after hydration
          if (state?.theme === "light") {
            document.documentElement.setAttribute("data-theme", "light");
          } else {
            document.documentElement.removeAttribute("data-theme");
          }
        };
      },
      partialize: (state) => ({ 
        user: state.user, 
        cart: state.cart, 
        wishlist: state.wishlist,
        theme: state.theme
      }),
    }
  )
);
