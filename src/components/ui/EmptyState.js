/**
 * /src/components/ui/EmptyState.js
 * Standardized EmptyState Component Primitive
 */

export function EmptyState({ iconSvg = '', title = 'No results found', description = '', actionLabel = '', onActionClick = '', className = '' }) {
  const iconHtml = iconSvg ? `<div class="ui-empty-icon text-text-tertiary text-4xl mb-3 flex justify-center">${iconSvg}</div>` : '';
  const descHtml = description ? `<p class="ui-empty-desc text-sm text-text-secondary mb-4">${description}</p>` : '';
  const actionBtnHtml = (actionLabel && onActionClick) 
    ? `<button class="ui-btn ui-btn-primary h-10 px-4 text-sm rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors" onclick="${onActionClick}">${actionLabel}</button>`
    : '';

  return `<div class="ui-empty-state text-center max-w-md mx-auto py-8 px-4 rounded-xl border border-dashed border-border-default bg-surface-raised/50 ${className}">
    ${iconHtml}
    <h3 class="ui-empty-title text-lg font-semibold text-text-primary mb-1">${title}</h3>
    ${descHtml}
    ${actionBtnHtml}
  </div>`;
}
