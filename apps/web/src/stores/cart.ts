import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductVariant, CartItem, AppliedCoupon } from '@csz/types';
import { getStrapiMediaUrl } from '@/lib/formatters';

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;

  // Actions
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;

  // Computed (implemented as getters)
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, variant, quantity = 1) => {
        const itemId = variant
          ? `${product.documentId}-${variant.documentId}`
          : product.documentId;

        set((state) => {
          const existingItem = state.items.find(item => item.id === itemId);

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              existingItem.maxStock
            );
            return {
              items: state.items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              ),
            };
          }

          // Use variant image if available, otherwise fall back to product image
          const imageSource = variant?.image?.url ?? product.images?.[0]?.url;
          const imageUrl = imageSource
            ? getStrapiMediaUrl(imageSource)
            : undefined;

          const newItem: CartItem = {
            id: itemId,
            productId: product.id,
            productDocumentId: product.documentId,
            variantId: variant?.id,
            variantDocumentId: variant?.documentId,
            name: product.name,
            variantName: variant?.name,
            sku: variant?.sku ?? product.sku,
            price: variant?.price ?? product.basePrice,
            quantity,
            image: imageUrl,
            maxStock: variant?.stock ?? product.stock,
          };

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.id !== id) };
        }
        return {
          items: state.items.map(item =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.maxStock) }
              : item
          ),
        };
      }),

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () => get().items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      ),

      getDiscount: () => {
        const { coupon } = get();
        return coupon ? coupon.discountAmount : 0;
      },

      getTotal: () => Math.max(0, get().getSubtotal() - get().getDiscount()),
    }),
    {
      name: 'csz-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal());
export const useCartDiscount = () => useCartStore((state) => state.getDiscount());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartCoupon = () => useCartStore((state) => state.coupon);
