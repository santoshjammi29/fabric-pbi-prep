/**
 * /src/components/ui/Simulator.js
 * Standardized 2-Column Composite Simulator Component Primitive
 */

export function Simulator({ title = '', description = '', inputsHtml = '', outputHtml = '', actionBtnHtml = '', className = '' }) {
  return `<div class="ui-simulator p-6 rounded-xl border border-border-default bg-surface-raised shadow-md ${className}">
    <div class="ui-simulator-header mb-4">
      <h3 class="ui-simulator-title text-xl font-bold text-text-primary tracking-snug">${title}</h3>
      ${description ? `<p class="ui-simulator-desc text-sm text-text-secondary mt-1">${description}</p>` : ''}
    </div>
    <div class="ui-simulator-grid grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div class="ui-simulator-inputs space-y-4">
        ${inputsHtml}
      </div>
      <div class="ui-simulator-output p-5 rounded-lg border border-border-subtle bg-surface-sunken flex flex-col justify-center items-center text-center">
        ${outputHtml}
        ${actionBtnHtml ? `<div class="mt-4">${actionBtnHtml}</div>` : ''}
      </div>
    </div>
  </div>`;
}
