/**
 * /src/components/ui/Heading.js
 * Standardized Heading Component Primitive
 */

export const HeadingMapping = {
  display: 'text-4xl font-bold font-sans text-text-primary tracking-tight',
  page:    'text-3xl font-bold font-sans text-text-primary tracking-tight',
  section: 'text-2xl font-semibold font-sans text-text-primary tracking-snug',
  card:    'text-lg font-semibold font-sans text-text-primary tracking-normal',
};

export function Heading({ level = 'h2', variant = 'section', iconSvg = '', text = '', className = '' }) {
  const Tag = level;
  const baseClasses = HeadingMapping[variant] || HeadingMapping.section;
  const iconHtml = iconSvg ? `<span class="ui-heading-icon" style="margin-right: 0.5rem; display: inline-flex; align-items: center;">${iconSvg}</span>` : '';
  
  return `<${Tag} class="ui-heading ui-heading-${variant} ${baseClasses} ${className}">${iconHtml}<span>${text}</span></${Tag}>`;
}
