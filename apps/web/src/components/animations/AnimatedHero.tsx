'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedHeroProps {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
}

export function AnimatedHero({
  children,
  className,
  backgroundImage,
}: AnimatedHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    if (!motionQuery.matches) {
      const handleScroll = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.bottom > 0) {
            setScrollY(window.scrollY);
          }
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        motionQuery.removeEventListener('change', handleMotionChange);
      };
    }

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Calculate parallax and fade effects
  const opacity = prefersReducedMotion ? 1 : Math.max(0, 1 - scrollY / 500);
  const translateY = prefersReducedMotion ? 0 : scrollY * 0.3;
  const scale = prefersReducedMotion ? 1 : 1 + scrollY * 0.0005;

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Background with parallax */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: `scale(${scale})`,
            transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

      {/* Content with fade and translate */}
      <div
        className="relative z-10"
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out, opacity 0.1s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
