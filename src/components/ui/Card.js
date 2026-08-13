/**
 * /src/components/ui/Card.js
 * Standardized Card Component Primitive
 */

export const CardMapping = {
  compact:     'p-3 rounded-md border border-border-subtle bg-surface-raised',
  default:     'p-4 rounded-lg border border-border-subtle bg-surface-raised hover:border-border-default transition-colors',
  feature:     'p-6 rounded-xl border border-border-default bg-surface-raised shadow-md hover:shadow-lg transition-shadow',
  interactive: 'p-4 rounded-lg border border-border-subtle bg-surface-raised hover:border-primary-500 hover:shadow-glow cursor-pointer transition-all',
};

export function Card({ variant = 'default', as = 'div', iconSvg = '', title = '', childrenHtml = '', actionHtml = '', footerHtml = '', className = '', onClick = '' }) {
  const Tag = as;
  const variantClass = CardMapping[variant] || CardMapping.default;
  const clickAttr = onClick ? `onclick="${onClick}"` : '';

  const headerHtml = (title || iconSvg || actionHtml) ? `
    <div class="ui-card-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        ${iconSvg ? `<span class="ui-card-icon">${iconSvg}</span>` : ''}
        ${title ? `<h4 class="ui-card-title text-lg font-semibold text-text-primary" style="margin:0;">${title}</h4>` : ''}
      </div>
      ${actionHtml ? `<div class="ui-card-action">${actionHtml}</div>` : ''}
    </div>
  ` : '';

  const footerSection = footerHtml ? `
    <div class="ui-card-footer" style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border-subtle);">
      ${footerHtml}
    </div>
  ` : '';

  return `<${Tag} class="ui-card ui-card-${variant} ${variantClass} ${className}" ${clickAttr}>
    ${headerHtml}
    <div class="ui-card-body">${childrenHtml}</div>
    ${footerSection}
  </${Tag}>`;
}
