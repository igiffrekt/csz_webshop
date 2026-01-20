---
phase: 04
plan: 04
subsystem: shopping-cart
tags: [cart-ui, shadcn, components, zustand]

dependency_graph:
  requires:
    - 04-02 (cart store)
  provides:
    - cart-icon
    - cart-item
    - cart-summary
    - scroll-area
    - separator
  affects:
    - 04-05 (cart sheet uses these components)
    - header (CartIcon integration)

tech_stack:
  added:
    - "@radix-ui/react-scroll-area"
    - "@radix-ui/react-separator"
  patterns:
    - Hydration-aware cart badge
    - Uncontrolled/controlled component pattern
    - Zustand selector hooks for optimized renders

key_files:
  created:
    - apps/web/src/components/ui/scroll-area.tsx
    - apps/web/src/components/ui/separator.tsx
    - apps/web/src/components/cart/CartIcon.tsx
    - apps/web/src/components/cart/CartItem.tsx
    - apps/web/src/components/cart/CartSummary.tsx
  modified:
    - apps/web/src/components/product/VariantSelector.tsx
    - apps/web/package.json
    - pnpm-lock.yaml

decisions:
  - id: hydration-badge
    description: Cart badge only renders after hydration
    rationale: Prevents SSR mismatch when server has 0 items, client has localStorage cart
  - id: uncontrolled-variant-selector
    description: VariantSelector supports both controlled and uncontrolled modes
    rationale: Allows use in Server Components without state prop drilling

metrics:
  duration: ~5 minutes
  completed: 2026-01-20
  tasks: 4/4
---

# Phase 04 Plan 04: Cart UI Foundation Summary

**One-liner:** Cart foundation components with shadcn ScrollArea/Separator, hydration-safe CartIcon badge, CartItem quantity controls, and CartSummary totals.

## What Was Built

### shadcn UI Components

**ScrollArea** (`apps/web/src/components/ui/scroll-area.tsx`)
- Radix-based scrollable container for cart item list
- Custom scrollbar styling
- Exports: `ScrollArea`, `ScrollBar`

**Separator** (`apps/web/src/components/ui/separator.tsx`)
- Visual divider for cart summary sections
- Horizontal/vertical orientation support
- Export: `Separator`

### CartIcon (`apps/web/src/components/cart/CartIcon.tsx`)

32-line component for header cart button:

```typescript
export function CartIcon({ onClick }: CartIconProps)
```

Features:
- Shopping cart icon from lucide-react
- Item count badge (hidden when 0, capped at 99+)
- Hydration-aware rendering (badge only after client hydration)
- Accessible aria-label includes item count
- Ghost button variant for header integration

### CartItem (`apps/web/src/components/cart/CartItem.tsx`)

86-line component for cart line items:

```typescript
export function CartItem({ item }: CartItemProps)
```

Features:
- Product image with Next.js Image optimization (80px)
- Placeholder when no image available
- Product name, variant name, SKU display
- Price formatted in HUF
- Quantity +/- buttons with min (1) and max (stock) limits
- Trash button to remove item
- All UI text in Hungarian

### CartSummary (`apps/web/src/components/cart/CartSummary.tsx`)

37-line component for cart totals:

```typescript
export function CartSummary()
```

Features:
- Subtotal (Reszosszeg)
- Coupon discount (green, shows code name)
- Visual separator
- Total (Osszesen) in larger font
- VAT notice (27% AFA)
- All UI text in Hungarian

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 9d5989c | feat | Add ScrollArea and Separator shadcn components |
| ffbe0f0 | feat | Create CartIcon component with badge |
| 6dc8635 | feat | Create CartItem component with quantity controls |
| ed149ed | feat | Create CartSummary component with totals |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed VariantSelector TypeScript error**
- **Found during:** Task 4 verification
- **Issue:** VariantSelector required `selectedVariant` and `onSelect` props but was used in Server Component without them
- **Fix:** Made props optional, added internal state for uncontrolled mode
- **Files modified:** `apps/web/src/components/product/VariantSelector.tsx`
- **Commit:** ed149ed (bundled with Task 4)

## Verification Results

- TypeScript compilation: PASS (`pnpm tsc --noEmit`)
- Production build: PASS (`pnpm build`)
- All 5 required files exist:
  - `apps/web/src/components/ui/scroll-area.tsx`
  - `apps/web/src/components/ui/separator.tsx`
  - `apps/web/src/components/cart/CartIcon.tsx`
  - `apps/web/src/components/cart/CartItem.tsx`
  - `apps/web/src/components/cart/CartSummary.tsx`

## Next Phase Readiness

**Ready for 04-05:** Cart Sheet component can now:
- Import `CartIcon` for header integration with onClick to open sheet
- Import `CartItem` to render scrollable list of cart items
- Import `CartSummary` for totals in sheet footer
- Use `ScrollArea` for item list container
- Use `Separator` for visual divisions

**Dependencies satisfied:**
- All cart UI building blocks created
- Components integrate with Zustand cart store
- Hydration safety built into CartIcon
