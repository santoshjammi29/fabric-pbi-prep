/**
 * /src/components/ui/Badge.js
 * Standardized Badge / Chip / Pill Component Primitive
 */

export const BadgeVariants = {
  neutral: 'bg-surface-overlay text-text-secondary border-none',
  primary: 'bg-primary-500/10 text-primary-500 border border-primary-500/30',
  success: 'bg-success-bg text-success-500 border border-success-500/30',
  warning: 'bg-warning-bg text-warning-500 border border-warning-500/30',
  danger:  'bg-danger-bg text-danger-500 border border-danger-500/30',
  info:    'bg-info-bg text-info-500 border border-info-500/30',
};

// Semantic mapping helpers
export function getDifficultyBadgeVariant(difficulty = '') {
  const d = String(difficulty).toUpperCase();
  if (d === 'EASY') return 'success';
  if (d === 'MEDIUM') return 'info';
  if (d === 'HARD') return 'warning';
  if (d === 'EXPERT') return 'danger';
  if (d === 'ARCHITECT') return 'primary';
  return 'neutral';
}

export function getRiskBadgeVariant(risk = '') {
  const r = String(risk).toUpperCase();
  if (r.includes('LOW')) return 'success';
  if (r.includes('MEDIUM')) return 'warning';
  if (r.includes('HIGH')) return 'danger';
  return 'neutral';
}

export function Badge({ variant = 'neutral', size = 'sm', iconSvg = '', label = '', className = '' }) {
  const variantClass = BadgeVariants[variant] || BadgeVariants.neutral;
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconHtml = iconSvg ? `<span class="ui-badge-icon" style="margin-right:0.35rem; display:inline-flex; align-items:center;">${iconSvg}</span>` : '';

  return `<span class="ui-badge ui-badge-${variant} ${variantClass} ${paddingClass} rounded-full font-medium inline-flex items-center ${className}">
    ${iconHtml}<span>${label}</span>
  </span>`;
}
