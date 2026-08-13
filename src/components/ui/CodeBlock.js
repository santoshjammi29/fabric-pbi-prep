/**
 * /src/components/ui/CodeBlock.js
 * Standardized CodeBlock Component Primitive
 */

export function CodeBlock({ code = '', language = 'python', showCopy = true, className = '' }) {
  const copyBtnHtml = showCopy ? `
    <button class="ui-code-copy-btn" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500);" style="position:absolute; top:0.5rem; right:0.5rem; font-size:0.75rem; background:rgba(255,255,255,0.08); border:1px solid var(--color-border-subtle); color:var(--color-text-secondary); padding:0.25rem 0.5rem; border-radius:0.375rem; cursor:pointer; transition:all var(--motion-fast);">
      Copy
    </button>
  ` : '';

  return `<div class="ui-code-block-wrapper relative rounded-md border border-border-subtle bg-surface-sunken p-4 ${className}" style="position:relative; margin:0.75rem 0;">
    ${copyBtnHtml}
    <pre class="font-mono text-sm text-text-primary" style="margin:0; overflow-x:auto;"><code class="language-${language}">${code}</code></pre>
  </div>`;
}
