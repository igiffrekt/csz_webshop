---
phase: 04
plan: 02
subsystem: shopping-cart
tags: [zustand, state-management, localStorage, cart]

dependency_graph:
  requires: []
  provides:
    - cart-store
    - cart-types
    - hydration-hook
  affects:
    - 04-03 (add-to-cart-button uses store)
    - 04-04 (cart-drawer uses store)
    - 04-05 (cart-page uses store)
    - 04-06 (coupon-api validates coupon)

tech_stack:
  added:
    - zustand@5.0.10
  patterns:
    - Zustand store with persist middleware
    - localStorage cart persistence
    - Hydration hook for SSR safety
    - Selector hooks for optimized re-renders

key_files:
  created:
    - apps/web/src/stores/cart.ts
    - apps/web/src/stores/useHydration.ts
  modified:
    - packages/types/src/index.ts
    - apps/web/package.json
    - pnpm-lock.yaml

decisions:
  - id: zustand-5
    description: Zustand 5.x for cart state management
    rationale: Minimal API, built-in persist middleware, excellent TypeScript support
  - id: localstorage-persist
    description: Persist cart to localStorage under 'csz-cart' key
    rationale: Cart survives browser sessions without backend storage
  - id: hydration-hook
    description: Simple useHydration hook for SSR safety
    rationale: Prevent hydration mismatches when server renders empty, client has cart

metrics:
  duration: ~3 minutes
  completed: 2026-01-20
  tasks: 4/4
---

# Phase 04 Plan 02: Cart Store & Persistence Summary

**One-liner:** Zustand cart store with localStorage persistence, computed totals, and SSR hydration safety.

## What Was Built

### Cart Store (apps/web/src/stores/cart.ts)

127-line Zustand store implementing:

**State:**
- `items: CartItem[]` - Cart line items with product/variant info
- `coupon: AppliedCoupon | null` - Applied discount coupon

**Actions:**
- `addItem(product, variant?, quantity?)` - Add or increment cart item
- `removeItem(id)` - Remove item by ID
- `updateQuantity(id, quantity)` - Update quantity (removes if <= 0)
- `clearCart()` - Empty cart and remove coupon
- `applyCoupon(coupon)` - Apply discount coupon
- `removeCoupon()` - Remove applied coupon

**Computed Getters:**
- `getItemCount()` - Total quantity across all items
- `getSubtotal()` - Sum of (price * quantity) for all items
- `getDiscount()` - Coupon discount amount
- `getTotal()` - Subtotal minus discount (minimum 0)

**Persistence:**
- localStorage key: `csz-cart`
- Only persists `items` and `coupon` (not functions)

**Selector Hooks (for optimized re-renders):**
- `useCartItems()` - Subscribe to items array only
- `useCartItemCount()` - Subscribe to item count only
- `useCartSubtotal()`, `useCartDiscount()`, `useCartTotal()`
- `useCartCoupon()` - Subscribe to coupon only

### Shared Types (packages/types/src/index.ts)

Added cart-specific interfaces:

```typescript
interface CartItem {
  id: string;                    // productDocId or productDocId-variantDocId
  productId: number;
  productDocumentId: string;
  variantId?: number;
  variantDocumentId?: string;
  name: string;
  variantName?: string;
  sku: string;
  price: number;                 // HUF at time of adding
  quantity: number;
  image?: string;
  maxStock: number;
}

interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;        // Calculated HUF discount
}
```

### Hydration Hook (apps/web/src/stores/useHydration.ts)

Simple hook to prevent "Hydration failed" errors:

```typescript
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
```

Usage in components:
```tsx
const hydrated = useHydration();
const count = useCartItemCount();
return <span>{hydrated ? count : 0}</span>;
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| a9a4a3c | chore | Install zustand for cart state management |
| e6754e7 | feat | Add CartItem and AppliedCoupon types |
| 5999572 | feat | Create Zustand cart store with localStorage persistence |
| 2ced6d6 | feat | Create hydration hook for SSR safety |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- TypeScript compilation: PASS
- Production build: PASS
- Cart store exports verified: useCartStore, useCartItems, useCartItemCount
- Hydration hook exports verified: useHydration
- File line count: 127 lines (requirement: min 80)

## Next Phase Readiness

**Ready for 04-03:** Cart store provides all APIs needed for AddToCartButton component:
- `useCartStore().addItem()` for adding products
- Types CartItem ready for cart line items
- Hydration hook ready for cart count in header

**Dependencies satisfied:**
- Zustand installed and configured
- Shared types exported from @csz/types
- localStorage persistence working
