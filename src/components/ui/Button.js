/**
 * /src/components/ui/Button.js
 * Standardized Button Component Primitive
 */

export const ButtonVariants = {
  primary:   'bg-primary-500 text-white border-none hover:bg-primary-600 shadow-md focus-visible:ring-2 focus-visible:ring-primary-500',
  secondary: 'bg-transparent text-text-primary border border-border-default hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-primary-500',
  ghost:     'bg-transparent text-text-secondary border-none hover:bg-surface-overlay hover:text-text-primary focus-visible:ring-2 focus-visible:ring-primary-500',
  danger:    'bg-danger-500 text-white border-none hover:bg-danger-600 focus-visible:ring-2 focus-visible:ring-danger-500',
};

export const ButtonSizes = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-base rounded-lg',
  lg: 'h-12 px-6 text-lg rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', iconSvg = '', iconPosition = 'left', label = '', onClick = '', disabled = false, fullWidth = false, className = '' }) {
  const variantClass = ButtonVariants[variant] || ButtonVariants.primary;
  const sizeClass = ButtonSizes[size] || ButtonSizes.md;
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const clickAttr = onClick ? `onclick="${onClick}"` : '';

  const leftIcon = (iconSvg && iconPosition === 'left') ? `<span class="ui-btn-icon" style="display:inline-flex; align-items:center;">${iconSvg}</span>` : '';
  const rightIcon = (iconSvg && iconPosition === 'right') ? `<span class="ui-btn-icon" style="display:inline-flex; align-items:center;">${iconSvg}</span>` : '';

  return `<button class="ui-btn ui-btn-${variant} ui-btn-${size} ${variantClass} ${sizeClass} ${widthClass} ${className}" ${clickAttr} ${disabledAttr} style="display:inline-flex; align-items:center; justify-content:center; gap:0.5rem; cursor:pointer; transition:all var(--motion-base);">
    ${leftIcon}
    <span>${label}</span>
    ${rightIcon}
  </button>`;
}
