/**
 * /src/components/ui/StatTile.js
 * Standardized StatTile Component Primitive
 */

export function StatTile({ label = '', value = '0', iconSvg = '', trend = null, variant = 'compact', className = '' }) {
  const isFeature = variant === 'feature';
  const paddingClass = isFeature ? 'p-6 rounded-xl' : 'p-4 rounded-lg';
  const valSizeClass = isFeature ? 'text-4xl font-bold' : 'text-2xl font-bold';

  let trendHtml = '';
  if (trend) {
    const isUp = trend.direction === 'up';
    const isDown = trend.direction === 'down';
    const badgeColor = isUp ? 'bg-success-bg text-success-500' : (isDown ? 'bg-danger-bg text-danger-500' : 'bg-surface-overlay text-text-secondary');
    const symbol = isUp ? '↑' : (isDown ? '↓' : '→');
    trendHtml = `<span class="ui-stat-trend text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}">${symbol} ${trend.value}</span>`;
  }

  return `<div class="ui-stat-tile ${paddingClass} border border-border-subtle bg-surface-raised flex flex-col gap-1 ${className}">
    <div class="flex items-center justify-between">
      <span class="ui-stat-label text-sm font-medium text-text-secondary">${label}</span>
      ${iconSvg ? `<span class="ui-stat-icon text-text-tertiary">${iconSvg}</span>` : ''}
    </div>
    <div class="flex items-baseline justify-between mt-1">
      <span class="ui-stat-value ${valSizeClass} text-text-primary tracking-tight">${value}</span>
      ${trendHtml}
    </div>
  </div>`;
}
