/**
 * Dunamenti CSZ Kft. Design Tokens
 *
 * Brand colors adapted from reference design with yellow/gold accent
 * for fire safety equipment branding.
 */

// Brand colors - Yellow/Gold primary for safety branding
export const colors = {
  // Primary - Yellow/Gold (safety branding)
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main yellow - use for primary actions
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Secondary - Dark gray/black for text and backgrounds
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827', // Main dark - use for text and footer
    950: '#030712',
  },
  // Accent colors for specific use cases
  accent: {
    red: '#dc2626', // Fire/danger, out of stock, destructive actions
    green: '#16a34a', // In stock, success states
    blue: '#2563eb', // Links, info states
  },
};

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.16' }],
    '6xl': ['3.75rem', { lineHeight: '1.1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Spacing system for consistent layouts
export const spacing = {
  section: '5rem', // 80px between major sections
  sectionSm: '2.5rem', // 40px for smaller sections
  container: '1280px', // Max container width
  containerNarrow: '960px', // Narrow container for content pages
  gutter: '1.5rem', // 24px gutter/padding
  gutterSm: '1rem', // 16px smaller gutter
};

// Shadow system
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Transition system
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Border radius
export const borderRadius = {
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

// Z-index scale
export const zIndex = {
  dropdown: 50,
  sticky: 100,
  modal: 200,
  popover: 300,
  tooltip: 400,
};
