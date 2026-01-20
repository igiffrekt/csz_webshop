# Phase 4: Shopping Cart - Research

**Researched:** 2026-01-20
**Domain:** Client-side Cart State Management, Cart Persistence, Coupon System, Add-to-Cart UX
**Confidence:** HIGH

## Summary

This phase implements the complete shopping cart experience: client-side cart state management, cart persistence across browser sessions, coupon/discount system in the CMS, and add-to-cart visual feedback animations. The research establishes Zustand as the standard for cart state management due to its minimal API, built-in persist middleware, and superior performance compared to Context API for frequently-updated state like cart items.

The architecture pattern separates concerns: Zustand manages optimistic client-side cart state with localStorage persistence, while the Fastify API backend validates inventory and applies coupon discounts server-side before checkout. This provides instant UI feedback while maintaining data integrity. The coupon system lives in Strapi as a new content type with admin management capabilities.

**Primary recommendation:** Use Zustand with persist middleware for cart state, implement a hydration wrapper to prevent Next.js SSR mismatches, create a Coupon content type in Strapi with percentage/fixed discount support, and use Motion (framer-motion) with Sonner toasts for add-to-cart feedback.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.x | Cart state management | Minimal API, built-in persist middleware, no provider needed, better than Context for frequent updates |
| zustand/middleware | 5.x | Persistence to localStorage | Native middleware, handles serialization, supports hydration |
| Sonner | 1.7+ | Toast notifications | shadcn/ui default, replaces deprecated toast component |
| Motion | 12.x | Add-to-cart animations | Already in stack from Phase 3, smooth feedback animations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.x | Inventory validation, coupon validation | Server mutations, optimistic updates for cart sync |
| uuid | 9.x | Cart line item IDs | Unique identifiers for cart items client-side |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Context API | Context re-renders all consumers on any change - bad for cart |
| Zustand | Redux Toolkit | Overkill for cart, more boilerplate, larger bundle |
| Zustand | Jotai | Atomic model better for derived state, Zustand better for single cart object |
| localStorage persist | Cookie persist | Cookies have 4KB limit, cart can be larger; cookies enable SSR but add complexity |

**Installation:**
```bash
# In apps/web
pnpm add zustand uuid
pnpm add -D @types/uuid

# Sonner already available via shadcn/ui - just add component
pnpm dlx shadcn@latest add sonner
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
  stores/
    cart.ts                    # Zustand cart store with persist
    useHydration.ts            # Hydration hook for SSR safety
  components/
    cart/
      CartProvider.tsx         # Hydration wrapper (minimal)
      CartSheet.tsx            # Slide-out cart panel (Client)
      CartItem.tsx             # Individual cart item row (Client)
      CartSummary.tsx          # Totals, coupon input (Client)
      CartIcon.tsx             # Header cart icon with count (Client)
      AddToCartButton.tsx      # Add to cart with animation (Client)
      CouponInput.tsx          # Coupon code entry (Client)
    animations/
      FlyToCart.tsx            # Flying product animation (Client)
  lib/
    cart-api.ts                # API calls for inventory/coupon validation

apps/api/src/
  routes/
    cart/
      validate.ts              # POST /cart/validate - inventory check
      coupon.ts                # POST /cart/apply-coupon - coupon validation

apps/cms/src/
  api/
    coupon/
      content-types/
        coupon/
          schema.json          # Coupon content type
```

### Pattern 1: Zustand Cart Store with TypeScript
**What:** Type-safe cart store with all cart operations
**When to use:** All cart state management throughout the app
**Example:**
```typescript
// stores/cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductVariant, Product } from '@csz/types';

export interface CartItem {
  id: string;                    // Unique cart line item ID
  productId: number;             // Strapi product ID
  productDocumentId: string;     // Strapi documentId
  variantId?: number;            // Optional variant ID
  variantDocumentId?: string;    // Variant documentId
  name: string;                  // Product name for display
  variantName?: string;          // Variant name (e.g., "6kg")
  sku: string;                   // SKU for the specific item
  price: number;                 // Price at time of adding
  quantity: number;              // Quantity in cart
  image?: string;                // Product image URL
  maxStock: number;              // Max available (for validation)
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;        // Calculated discount in HUF
}

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

  // Computed (getters via selectors)
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
            // Increment quantity, respecting max stock
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              existingItem.maxStock
            );
            return {
              items: state.items.map(item =>
                item.id === itemId
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          // Add new item
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
            image: product.images?.[0]?.url,
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
        if (!coupon) return 0;
        return coupon.discountAmount;
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
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartCoupon = () => useCartStore((state) => state.coupon);
```

### Pattern 2: Hydration Wrapper for SSR Safety
**What:** Prevents hydration mismatch errors with localStorage persist
**When to use:** Wrap any component that renders cart count/items on initial load
**Example:**
```typescript
// stores/useHydration.ts
import { useEffect, useState } from 'react';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

// components/cart/CartIcon.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartItemCount } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';
import { Button } from '@/components/ui/button';

export function CartIcon({ onClick }: { onClick?: () => void }) {
  const itemCount = useCartItemCount();
  const hydrated = useHydration();

  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="relative">
      <ShoppingCart className="h-5 w-5" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
```

### Pattern 3: Add-to-Cart with Animation and Toast
**What:** Button that triggers cart add with visual feedback
**When to use:** Product detail page, product cards with quick-add
**Example:**
```typescript
// components/cart/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import type { Product, ProductVariant } from '@csz/types';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle');
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (status !== 'idle') return;

    // Check stock
    const stock = variant?.stock ?? product.stock;
    if (stock === 0) {
      toast.error('A termek nincs keszleten');
      return;
    }

    setStatus('adding');

    // Simulate brief delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));

    addItem(product, variant, quantity);
    setStatus('added');

    toast.success('Termek hozzaadva a kosarhoz', {
      description: variant
        ? `${product.name} - ${variant.name}`
        : product.name,
    });

    // Reset after animation
    setTimeout(() => setStatus('idle'), 1500);
  };

  const isOutOfStock = (variant?.stock ?? product.stock) === 0;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isOutOfStock || status !== 'idle'}
      className="relative overflow-hidden min-w-[160px]"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'Elfogyott' : 'Kosarba'}
          </motion.span>
        )}

        {status === 'adding' && (
          <motion.span
            key="adding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.span>
        )}

        {status === 'added' && (
          <motion.span
            key="added"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Hozzaadva!
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
```

### Pattern 4: Coupon Content Type Schema (Strapi)
**What:** Strapi collection type for managing discount coupons
**When to use:** Admin creates/manages coupon codes
**Example:**
```json
{
  "kind": "collectionType",
  "collectionName": "coupons",
  "info": {
    "singularName": "coupon",
    "pluralName": "coupons",
    "displayName": "Coupon"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "code": {
      "type": "string",
      "required": true,
      "unique": true,
      "maxLength": 50
    },
    "description": {
      "type": "text"
    },
    "discountType": {
      "type": "enumeration",
      "enum": ["percentage", "fixed"],
      "required": true,
      "default": "percentage"
    },
    "discountValue": {
      "type": "integer",
      "required": true,
      "min": 0
    },
    "minimumOrderAmount": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "maximumDiscount": {
      "type": "integer",
      "min": 0
    },
    "usageLimit": {
      "type": "integer",
      "min": 0
    },
    "usedCount": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "validFrom": {
      "type": "datetime"
    },
    "validUntil": {
      "type": "datetime"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  }
}
```

### Pattern 5: Fastify Coupon Validation Route
**What:** Server-side coupon validation with business logic
**When to use:** User applies coupon code at checkout
**Example:**
```typescript
// apps/api/src/routes/cart/coupon.ts
import { FastifyInstance } from 'fastify';
import qs from 'qs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface ApplyCouponBody {
  code: string;
  subtotal: number;
}

interface CouponResponse {
  valid: boolean;
  error?: string;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  };
}

export async function couponRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ApplyCouponBody }>(
    '/cart/apply-coupon',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code', 'subtotal'],
          properties: {
            code: { type: 'string', minLength: 1 },
            subtotal: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (request, reply): Promise<CouponResponse> => {
      const { code, subtotal } = request.body;

      // Fetch coupon from Strapi
      const query = qs.stringify({
        filters: {
          code: { $eqi: code }, // Case-insensitive match
          isActive: { $eq: true },
        },
      }, { encodeValuesOnly: true });

      const res = await fetch(`${STRAPI_URL}/api/coupons?${query}`);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        return { valid: false, error: 'Ervenytelen kuponkod' };
      }

      const coupon = data.data[0];
      const now = new Date();

      // Validate dates
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return { valid: false, error: 'A kupon meg nem ervenyes' };
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return { valid: false, error: 'A kupon lejart' };
      }

      // Validate usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: 'A kupon elerte a hasznalati limitet' };
      }

      // Validate minimum order
      if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
        return {
          valid: false,
          error: `Minimum rendelesi osszeg: ${coupon.minimumOrderAmount} Ft`
        };
      }

      // Calculate discount
      let discountAmount: number;
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
        // Apply maximum discount cap if set
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      // Don't allow discount greater than subtotal
      discountAmount = Math.min(discountAmount, subtotal);

      return {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
        },
      };
    }
  );
}
```

### Pattern 6: Cart Sheet (Slide-out Panel)
**What:** Slide-out cart panel using shadcn/ui Sheet
**When to use:** Clicking cart icon in header
**Example:**
```typescript
// components/cart/CartSheet.tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCartItems, useCartSubtotal, useCartTotal, useCartCoupon } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';
import { formatPrice } from '@/lib/formatters';
import { CartItem } from './CartItem';
import { CouponInput } from './CouponInput';
import Link from 'next/link';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const total = useCartTotal();
  const coupon = useCartCoupon();
  const hydrated = useHydration();

  if (!hydrated) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Kosar ({items.length} termek)</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">A kosar ures</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4">
              <Separator />

              <CouponInput />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reszosszeg</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Kedvezmeny ({coupon.code})</span>
                    <span>-{formatPrice(coupon.discountAmount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Osszesen</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        <SheetFooter className="mt-4">
          <Button
            asChild
            className="w-full"
            size="lg"
            disabled={items.length === 0}
          >
            <Link href="/penztar" onClick={() => onOpenChange(false)}>
              Tovabb a penztarhoz
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Anti-Patterns to Avoid
- **Storing cart in Context API:** Context re-renders all consumers on any change - disastrous for cart updates
- **Persisting to cookies for SSR:** 4KB limit is too small for cart with images, adds complexity
- **Server-side cart without client state:** Round-trips slow; use optimistic updates locally
- **Validating inventory on every cart change:** Only validate at checkout to reduce API calls
- **Storing full product data in cart:** Store IDs and display data only; re-fetch at checkout
- **Animating everything:** Only animate add-to-cart and key feedback moments

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cart state management | Custom Context + useReducer | Zustand with persist | Built-in persistence, no provider, better performance |
| localStorage persistence | Manual JSON.parse/stringify | zustand/middleware persist | Handles edge cases, hydration, versioning |
| Toast notifications | Custom notification system | Sonner (shadcn/ui) | Accessible, animated, battle-tested |
| Slide-out panel | Custom drawer | shadcn/ui Sheet | Keyboard accessible, animation built-in |
| Quantity increment | Custom counter | shadcn/ui NumberInput or Input with +/- | Accessible, handles edge cases |
| Coupon validation | Client-side only | Server-side validation | Security - client can be bypassed |

**Key insight:** Cart state is a solved problem. Zustand + persist middleware handles all the edge cases (hydration, migration, partialize) that you'd spend days debugging with a custom solution.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with Persist Middleware
**What goes wrong:** "Hydration failed because the initial UI does not match server" error
**Why it happens:** Server renders with empty cart, client loads from localStorage with items
**How to avoid:**
1. Use hydration hook to render cart count as 0 until client hydrated
2. Or use Zustand's `onRehydrateStorage` to delay render
3. Test with `pnpm build && pnpm start` (not just dev mode)
**Warning signs:** Errors only in production/build, cart count flickers on load

### Pitfall 2: Stale Stock Data in Cart
**What goes wrong:** User adds item with stock=5, checks out next day when stock=0
**Why it happens:** Cart stores stock snapshot at add-time
**How to avoid:**
1. Re-validate inventory at checkout (Fastify route)
2. Show "stock may have changed" warning if cart is old
3. Update maxStock when user views cart (optional background sync)
**Warning signs:** Orders failing at payment, overselling

### Pitfall 3: Coupon Validation Bypass
**What goes wrong:** Users apply invalid coupons by manipulating client state
**Why it happens:** Coupon discount calculated client-side only
**How to avoid:**
1. ALWAYS validate coupon server-side at checkout
2. Re-calculate discount on server before payment
3. Client-side validation is for UX only, not security
**Warning signs:** Orders with impossible discounts, negative totals

### Pitfall 4: Cart Bloat in localStorage
**What goes wrong:** Cart grows unbounded, localStorage fills up (5MB limit)
**Why it happens:** Storing full product objects, images as base64, etc.
**How to avoid:**
1. Use `partialize` in persist to store only essential fields
2. Store IDs and display-necessary data only
3. Implement cart expiry (clear carts older than 30 days)
**Warning signs:** localStorage quota errors, slow page loads

### Pitfall 5: Missing Variant Selection
**What goes wrong:** User adds product without selecting required variant
**Why it happens:** No validation before addItem, button not disabled
**How to avoid:**
1. Disable Add to Cart until variant selected (when product has variants)
2. Validate in addItem that variant exists when product.variants.length > 0
3. Show clear UI that variant selection is required
**Warning signs:** Orders with wrong prices, missing SKUs

### Pitfall 6: Animation Performance on Low-End Devices
**What goes wrong:** Janky animations, frozen UI during cart add
**Why it happens:** Animating too many elements, not respecting prefers-reduced-motion
**How to avoid:**
1. Keep animations simple (opacity, transform only)
2. Use `@media (prefers-reduced-motion: reduce)` to disable
3. Test on throttled CPU in DevTools
**Warning signs:** Low Lighthouse performance score, user complaints

## Code Examples

Verified patterns from official sources:

### Sonner Toast Setup in Layout
```typescript
// app/[locale]/layout.tsx
import { Toaster } from '@/components/ui/sonner';

export default function LocaleLayout({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: 'group toast',
            success: 'bg-green-50 border-green-200',
            error: 'bg-red-50 border-red-200',
          },
        }}
      />
    </>
  );
}
```

### Cart Item Component with Quantity Controls
```typescript
// components/cart/CartItem.tsx
'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem as CartItemType } from '@/stores/cart';
import { formatPrice } from '@/lib/formatters';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-4">
      {item.image && (
        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.name}</h4>
        {item.variantName && (
          <p className="text-sm text-muted-foreground">{item.variantName}</p>
        )}
        <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-8 text-center text-sm">{item.quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Coupon Input with Server Validation
```typescript
// components/cart/CouponInput.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartSubtotal } from '@/stores/cart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function CouponInput() {
  const [code, setCode] = useState('');
  const subtotal = useCartSubtotal();
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const mutation = useMutation({
    mutationFn: async (couponCode: string) => {
      const res = await fetch(`${API_URL}/cart/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        applyCoupon(data.coupon);
        toast.success('Kupon alkalmazva!');
        setCode('');
      } else {
        toast.error(data.error);
      }
    },
    onError: () => {
      toast.error('Hiba tortent a kupon ellenorzese soran');
    },
  });

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
        <span className="text-sm text-green-700">
          Kupon: <strong>{coupon.code}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={removeCoupon}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) mutation.mutate(code.trim());
      }}
      className="flex gap-2"
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Kuponkod"
        className="flex-1"
      />
      <Button
        type="submit"
        variant="secondary"
        disabled={mutation.isPending || !code.trim()}
      >
        {mutation.isPending ? 'Ellenorzes...' : 'Alkalmaz'}
      </Button>
    </form>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for cart | Zustand | 2022-2024 | 90% less boilerplate, better bundle size |
| framer-motion | motion/react | 2025 | Better Next.js integration, smaller bundle |
| Custom toast | Sonner | 2024 | shadcn/ui default, better accessibility |
| Cookie-based cart | localStorage persist | Best practice | No 4KB limit, simpler implementation |
| Server-only cart | Client optimistic + server validate | Best practice | Instant UI feedback, secure checkout |

**Deprecated/outdated:**
- **Redux Toolkit for simple cart:** Overkill for cart state, Zustand is standard
- **react-toastify:** Sonner is now the shadcn/ui recommendation
- **Custom drawer components:** shadcn/ui Sheet is accessible and themeable

## Open Questions

Things that couldn't be fully resolved:

1. **Cart Merging After Login**
   - What we know: Cart exists before user logs in
   - What's unclear: How to merge anonymous cart with user's saved cart (Phase 5/6)
   - Recommendation: For now, cart is anonymous-only. Plan for merge logic in checkout phase.

2. **Coupon Usage Tracking**
   - What we know: Strapi has usedCount field
   - What's unclear: When to increment (at apply or at successful order?)
   - Recommendation: Increment at successful order creation (Phase 5), not at apply

3. **Multi-Tab Cart Sync**
   - What we know: Zustand persist uses localStorage which syncs across tabs
   - What's unclear: Whether real-time sync is needed or page refresh is acceptable
   - Recommendation: Use storage event listener for real-time sync if needed, but page refresh is acceptable for MVP

## Sources

### Primary (HIGH confidence)
- [Zustand GitHub](https://github.com/pmndrs/zustand) - State management patterns, persist middleware
- [Zustand Persist Documentation](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) - Persist configuration
- [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/sonner) - Toast notification setup
- [Motion for React](https://motion.dev/docs/react) - Animation patterns
- [Fastify Validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) - Schema validation

### Secondary (MEDIUM confidence)
- [Zustand Hydration Solutions (Medium)](https://medium.com/@judemiracle/fixing-react-hydration-errors-when-using-zustand-persist-with-usesyncexternalstore-b6d7a40f2623) - Hydration fix patterns
- [Building Shopping Cart with Zustand (HackerNoon)](https://hackernoon.com/how-to-build-a-shopping-cart-with-nextjs-and-zustand-state-management-with-typescript) - Cart store patterns
- [Zustand Cart Pattern (DEV)](https://dev.to/rifkyalfarez/cart-feature-in-reactjs-using-zustand-515l) - Add/remove/update patterns
- [Coupon System Design (GeeksforGeeks)](https://www.geeksforgeeks.org/system-design/design-coupon-and-voucher-management-system/) - Coupon schema design

### Tertiary (LOW confidence)
- Community tutorials on ecommerce cart patterns - verify against official docs before use

## Metadata

**Confidence breakdown:**
- Cart state management (Zustand): HIGH - Official docs, multiple tutorials agree
- Persist/hydration pattern: HIGH - Well-documented in Zustand ecosystem
- Coupon schema: MEDIUM - Based on common patterns, verify with requirements
- Animation patterns: HIGH - Motion docs, already used in Phase 3
- Fastify validation: HIGH - Official Fastify documentation

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable ecosystem)
