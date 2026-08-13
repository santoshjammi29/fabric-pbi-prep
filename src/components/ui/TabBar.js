/**
 * /src/components/ui/TabBar.js
 * Standardized TabBar Component Primitive
 */

export function TabBar({ tabs = [], activeValue = '', onChangeFn = 'switchView', orientation = 'horizontal', className = '' }) {
  const isVert = orientation === 'vertical';
  const flexDir = isVert ? 'flex-col border-l border-border-subtle' : 'flex-row border-b border-border-subtle';

  const tabsHtml = tabs.map(t => {
    const isActive = t.value === activeValue;
    const activeClass = isActive 
      ? (isVert ? 'border-l-2 border-primary-500 bg-surface-overlay text-text-primary' : 'border-b-2 border-primary-500 text-text-primary font-semibold')
      : 'text-text-secondary border-transparent hover:text-text-primary';
    
    const iconHtml = t.iconSvg ? `<span class="ui-tab-icon">${t.iconSvg}</span>` : '';
    const badgeHtml = t.badge ? `<span class="ui-tab-badge ml-1.5">${t.badge}</span>` : '';

    return `<button role="tab" aria-selected="${isActive}" class="ui-tab-btn px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${activeClass}" onclick="${onChangeFn}('${t.value}')">
      ${iconHtml}
      <span>${t.label}</span>
      ${badgeHtml}
    </button>`;
  }).join('');

  return `<div role="tablist" class="ui-tab-bar flex ${flexDir} overflow-x-auto snap-x sticky top-0 z-20 bg-surface-base ${className}" style="scrollbar-width:none;">
    ${tabsHtml}
  </div>`;
}
