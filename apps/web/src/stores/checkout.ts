import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type CheckoutStep = 'shipping' | 'billing' | 'summary' | 'payment';

interface CheckoutState {
  // Current step
  step: CheckoutStep;

  // Shipping address selection
  shippingAddressId: string | null;
  useNewShippingAddress: boolean;
  newShippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  } | null;

  // Billing address
  useSameAsBilling: boolean;
  billingAddressId: string | null;
  useNewBillingAddress: boolean;
  newBillingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    companyName?: string;
    vatNumber?: string;
  } | null;

  // B2B
  poReference: string;

  // Calculated totals (from server)
  calculatedTotals: {
    subtotal: number;
    discount: number;
    shipping: number;
    vatAmount: number;
    total: number;
  } | null;

  // Actions
  setStep: (step: CheckoutStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setShippingAddressId: (id: string | null) => void;
  setUseNewShippingAddress: (use: boolean) => void;
  setNewShippingAddress: (address: CheckoutState['newShippingAddress']) => void;

  setUseSameAsBilling: (same: boolean) => void;
  setBillingAddressId: (id: string | null) => void;
  setUseNewBillingAddress: (use: boolean) => void;
  setNewBillingAddress: (address: CheckoutState['newBillingAddress']) => void;

  setPoReference: (ref: string) => void;
  setCalculatedTotals: (totals: CheckoutState['calculatedTotals']) => void;

  reset: () => void;
}

const stepOrder: CheckoutStep[] = ['shipping', 'billing', 'summary', 'payment'];

const initialState = {
  step: 'shipping' as CheckoutStep,
  shippingAddressId: null,
  useNewShippingAddress: false,
  newShippingAddress: null,
  useSameAsBilling: true,
  billingAddressId: null,
  useNewBillingAddress: false,
  newBillingAddress: null,
  poReference: '',
  calculatedTotals: null,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextStep: () => {
        const currentIndex = stepOrder.indexOf(get().step);
        if (currentIndex < stepOrder.length - 1) {
          set({ step: stepOrder[currentIndex + 1] });
        }
      },

      prevStep: () => {
        const currentIndex = stepOrder.indexOf(get().step);
        if (currentIndex > 0) {
          set({ step: stepOrder[currentIndex - 1] });
        }
      },

      setShippingAddressId: (id) => set({ shippingAddressId: id, useNewShippingAddress: false }),
      setUseNewShippingAddress: (use) => set({ useNewShippingAddress: use, shippingAddressId: null }),
      setNewShippingAddress: (address) => set({ newShippingAddress: address }),

      setUseSameAsBilling: (same) => set({ useSameAsBilling: same }),
      setBillingAddressId: (id) => set({ billingAddressId: id, useNewBillingAddress: false }),
      setUseNewBillingAddress: (use) => set({ useNewBillingAddress: use, billingAddressId: null }),
      setNewBillingAddress: (address) => set({ newBillingAddress: address }),

      setPoReference: (ref) => set({ poReference: ref }),
      setCalculatedTotals: (totals) => set({ calculatedTotals: totals }),

      reset: () => set(initialState),
    }),
    {
      name: 'csz-checkout',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        shippingAddressId: state.shippingAddressId,
        useNewShippingAddress: state.useNewShippingAddress,
        newShippingAddress: state.newShippingAddress,
        useSameAsBilling: state.useSameAsBilling,
        billingAddressId: state.billingAddressId,
        useNewBillingAddress: state.useNewBillingAddress,
        newBillingAddress: state.newBillingAddress,
        poReference: state.poReference,
        // Don't persist calculatedTotals - always fetch fresh from server
      }),
    }
  )
);

// Selectors
export const useCheckoutStep = () => useCheckoutStore((s) => s.step);
export const useShippingAddressId = () => useCheckoutStore((s) => s.shippingAddressId);
export const useCalculatedTotals = () => useCheckoutStore((s) => s.calculatedTotals);
