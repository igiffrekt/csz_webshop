'use client';

import { useState } from 'react';
import { CartIcon } from '@/components/cart/CartIcon';
import { CartSheet } from '@/components/cart/CartSheet';

export function HeaderCart() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <CartIcon onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
