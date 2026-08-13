/**
 * /src/design/tokens.js
 * JavaScript runtime export of design system tokens
 */

const tokens = {
  color: {
    surface: {
      base: '#0a0a0a',
      raised: '#171717',
      overlay: '#262626',
      sunken: '#0f0f0f',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a3a3a3',
      tertiary: '#737373',
      inverse: '#0a0a0a',
    },
    border: {
      subtle: '#262626',
      default: '#404040',
      strong: '#525252',
      focus: '#3b82f6',
    },
    primary:   { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
    secondary: { 500: '#8b5cf6', 600: '#7c3aed' },
    success:   { 500: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    warning:   { 500: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    danger:    { 500: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    info:      { 500: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  },
  font: {
    family: {
      sans: 'Inter, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
    },
    size: {
      xs:   'clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)',
      sm:   'clamp(0.875rem, 0.8rem + 0.3vw, 0.9375rem)',
      base: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',
      lg:   'clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',
      xl:   'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',
      '2xl':'clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)',
      '3xl':'clamp(1.875rem, 1.5rem + 1.5vw, 2.5rem)',
      '4xl':'clamp(2.25rem, 1.8rem + 2vw, 3.5rem)',
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.2, snug: 1.35, normal: 1.5, relaxed: 1.65 },
  },
  space: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem',
    24: '6rem',
  },
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.5)',
    glow: '0 0 0 1px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.3)',
  },
  motion: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '320ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { tokens };
}
