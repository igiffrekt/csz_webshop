'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect when client-side hydration is complete.
 * Use this to conditionally render cart count/items that differ
 * between server (empty) and client (localStorage).
 *
 * @returns true when component is hydrated and safe to show client state
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
